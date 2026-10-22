import { createGraphQLError, createYoga } from 'graphql-yoga'
import { schema } from '@/lib/graphql/schema'
import { cachingPlugin } from '@/lib/graphql/caching'
import { logError } from '@/lib/logger'
import { securityPlugin } from '@/lib/graphql/security'

export const GRAPHQL_PATH = '/api/graphql'

// Duck-typed (not `instanceof GraphQLError`): the graphql package can be loaded
// twice (ESM and CJS builds), and instanceof fails across those copies.
function isIntentionalError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const { name, originalError } = error as { name?: string; originalError?: unknown }
  if (name !== 'GraphQLError') return false
  return originalError != null ? isIntentionalError(originalError) : true
}

const isProduction = process.env.NODE_ENV === 'production'

export const yoga = createYoga({
  schema,
  graphqlEndpoint: GRAPHQL_PATH,
  fetchAPI: { Response },
  graphiql: !isProduction,
  // Clients only ever see a generic message; the real error is logged as a
  // structured line so it can be found and alerted on.
  maskedErrors: {
    maskError(error, message) {
      // Intentional errors (e.g. argument validation in resolvers) are meant
      // for the client; only unexpected failures get masked and logged.
      if (isIntentionalError(error)) return error as Error
      const original = (error as { originalError?: unknown }).originalError ?? error
      logError('GraphQL resolver error', original)
      return createGraphQLError(message, { extensions: { code: 'INTERNAL_SERVER_ERROR' } })
    },
  },
  plugins: [securityPlugin({ production: isProduction }), cachingPlugin()],
})
