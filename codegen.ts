import type { CodegenConfig } from '@graphql-codegen/cli'

const shared = {
  scalars: { JSON: 'Record<string, string>' },
  enumsAsTypes: true,
  enumType: 'string-literal' as const,
  skipTypename: true,
  useTypeImports: true,
}

// Two files: `schema-types.ts` mirrors the schema (used for the domain
// `Country` type), `operations.ts` types our queries' variables and results.
const config: CodegenConfig = {
  schema: 'src/lib/graphql/type-defs.ts',
  documents: 'src/lib/graphql/documents.ts',
  generates: {
    'src/lib/graphql/schema-types.ts': {
      plugins: ['typescript'],
      config: shared,
    },
    'src/lib/graphql/operations.ts': {
      plugins: ['typescript-operations'],
      config: shared,
    },
  },
}

export default config
