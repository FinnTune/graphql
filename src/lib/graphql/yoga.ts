import { createYoga } from 'graphql-yoga'
import { schema } from '@/lib/graphql/schema'
import { cachingPlugin } from '@/lib/graphql/caching'
import { securityPlugin } from '@/lib/graphql/security'

export const GRAPHQL_PATH = '/api/graphql'

const isProduction = process.env.NODE_ENV === 'production'

export const yoga = createYoga({
  schema,
  graphqlEndpoint: GRAPHQL_PATH,
  fetchAPI: { Response },
  graphiql: !isProduction,
  plugins: [securityPlugin({ production: isProduction }), cachingPlugin()],
})
