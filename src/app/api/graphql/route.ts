import { yoga } from '@/lib/graphql/yoga'

function handler(request: Request) {
  return yoga.handleRequest(request, {})
}

export { handler as GET, handler as POST, handler as OPTIONS }
