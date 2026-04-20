import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (error) => {
          if ('status' in error && error.status === 401) {
            // clear the isLoggedIn state
          }
        }
      }
    }
  });