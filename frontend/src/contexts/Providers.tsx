import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./auth-context/AuthProvider"
import { GameContextProvider } from "./game-context/GameContextProvider"
import { ErrorContextProvider } from "./error-context/ErrorContextProvider"
import { useMemo } from "react"
import { useErrorContext } from "./error-context/ErrorContext"
import { ModalContextProvider } from "./modal-context/ModalContextProvider"

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
    return <ErrorContextProvider> 
        <QueryClientWithErrorHandling>
            <AuthProvider>
                <GameContextProvider>
                    <ModalContextProvider>
                        {children}
                    </ModalContextProvider>
                </GameContextProvider>
            </AuthProvider>
        </QueryClientWithErrorHandling>
    </ErrorContextProvider>;
}