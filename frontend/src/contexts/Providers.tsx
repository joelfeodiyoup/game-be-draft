import { QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./AuthProvider"
import { queryClient } from "./QueryClientProvider"

export const Providers = ({children}: {children: React.ReactNode}) => {
    return <AuthProvider>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </AuthProvider>
}