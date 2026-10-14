import {
  GraphQLError,
  Kind,
  NoSchemaIntrospectionCustomRule,
  type ASTVisitor,
  type FragmentDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from 'graphql'
import type { Plugin } from 'graphql-yoga'

export const MAX_QUERY_DEPTH = 6
export const MAX_QUERY_LENGTH = 4000

function selectionDepth(
  selectionSet: SelectionSetNode,
  fragments: Map<string, FragmentDefinitionNode>,
  visited: Set<string>
): number {
  let deepest = 0

  for (const selection of selectionSet.selections) {
    let depth = 1
    if (selection.kind === Kind.FIELD && selection.selectionSet) {
      depth += selectionDepth(selection.selectionSet, fragments, visited)
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      // Fragments don't add a level of nesting themselves.
      depth = selectionDepth(selection.selectionSet, fragments, visited)
    } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = fragments.get(selection.name.value)
      // Cyclic fragments are rejected by the standard NoFragmentCycles rule.
      if (fragment && !visited.has(fragment.name.value)) {
        depth = selectionDepth(
          fragment.selectionSet,
          fragments,
          new Set(visited).add(fragment.name.value)
        )
      }
    }
    deepest = Math.max(deepest, depth)
  }

  return deepest
}

/** Rejects operations nested deeper than `maxDepth` fields. */
export function depthLimitRule(maxDepth: number): ValidationRule {
  return (context: ValidationContext): ASTVisitor => {
    const fragments = new Map<string, FragmentDefinitionNode>()
    for (const definition of context.getDocument().definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(definition.name.value, definition)
      }
    }

    return {
      OperationDefinition(operation) {
        const depth = selectionDepth(operation.selectionSet, fragments, new Set())
        if (depth > maxDepth) {
          context.reportError(
            new GraphQLError(`Query depth ${depth} exceeds the maximum of ${maxDepth}.`, {
              nodes: [operation],
            })
          )
        }
      },
    }
  }
}

/**
 * Hardening for the public endpoint: caps query size and nesting depth, and
 * (in production) disables schema introspection.
 */
export function securityPlugin({ production }: { production: boolean }): Plugin {
  return {
    onParams({ params, setResult }) {
      if (params.query && params.query.length > MAX_QUERY_LENGTH) {
        setResult({
          errors: [new GraphQLError(`Query exceeds the maximum length of ${MAX_QUERY_LENGTH} characters.`)],
        })
      }
    },
    onValidate({ addValidationRule }) {
      addValidationRule(depthLimitRule(MAX_QUERY_DEPTH))
      if (production) addValidationRule(NoSchemaIntrospectionCustomRule)
    },
  }
}
