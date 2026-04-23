import { QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./AuthProvider"
import { queryClient } from "./QueryClientProvider"
import { GameContextProvider } from "./GameContextProvider"
import { ErrorContextProvider } from "./ErrorContextProvider"

export const Providers = ({children}: {children: React.ReactNode}) => {
    return <AuthProvider>
        <ErrorContextProvider>
        <GameContextProvider>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
        </GameContextProvider>
        </ErrorContextProvider>
    </AuthProvider>
}