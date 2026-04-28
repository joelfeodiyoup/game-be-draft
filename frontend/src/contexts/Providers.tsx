import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./AuthProvider"
import { GameContextProvider } from "./GameContextProvider"
import { ErrorContextProvider } from "./ErrorContextProvider"
import { useMemo } from "react"
import { useErrorContext } from "./ErrorContext"

interface ApiError {
    status: number;
    message: string;
}

const QueryClientWithErrorHandling = ({children}: {children: React.ReactNode}) => {
    const { setErrorMessage } = useErrorContext();

    const queryClient = useMemo(() => new QueryClient({
        defaultOptions: {
            mutations: {
                onError: (error) => {
                    const apiError = error as unknown as ApiError;
                    if (apiError?.status >= 400 && apiError?.status < 500) {
                        const errorMsg = error?.message || `Error ${apiError?.status}: Request failed`;
                        setErrorMessage(errorMsg);
                    }
                }
            },
        },
        queryCache: new QueryCache({
            onError: (error) => {
                const apiError = error as unknown as ApiError;
                if (apiError?.status >= 400 && apiError?.status < 500) {
                    const errorMsg = error?.message || `Error ${apiError?.status}: Request failed`;
                    setErrorMessage(errorMsg);
                }
            }
        })
    }), [setErrorMessage]);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export const Providers = ({children}: {children: React.ReactNode}) => {
    return <AuthProvider>
        <ErrorContextProvider>
        <GameContextProvider>
        <QueryClientWithErrorHandling>{children}</QueryClientWithErrorHandling>
        </GameContextProvider>
        </ErrorContextProvider>
    </AuthProvider>
}