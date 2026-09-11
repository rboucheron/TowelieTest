import { QueryClient } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export interface RouterContext {
  queryClient: QueryClient
}

export function getRouter() {
  // A fresh QueryClient per router instance: one per SSR request on the server,
  // one for the lifetime of the tab on the client. Routes never prefetch
  // authenticated data in a loader, so this client is never populated with
  // another user's data across requests.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: false,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
