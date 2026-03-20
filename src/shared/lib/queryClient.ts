import { QueryClient } from '@tanstack/react-query'

/**
 * Singleton QueryClient shared across the app.
 * Each game's mock API will use this client via useQuery / useLoaderData.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
