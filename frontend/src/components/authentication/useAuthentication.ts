import { useAuthContext } from "@/contexts/AuthContext";
import { useErrorContext } from "@/contexts/ErrorContext";
import { urls, defaultFetchOptions } from "@/data/fetchOptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuthentication = () => {
    const { setIsLoggedIn } = useAuthContext();
    const { setErrorMessage } = useErrorContext();
    const queryClient = useQueryClient();

    const logoutMutation = useMutation({
        mutationFn: () => fetch(urls.logout, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({})
        }),
        onSuccess: () => {
            setIsLoggedIn(false);
            queryClient.clear();
        },
        onError: () => {
            setErrorMessage('error while logging out');
        }
    });

    const createAccount = useMutation({
        mutationFn: (credentials: {username: string, password: string}) => fetch(urls.createAccount, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        onError: () => {
            setErrorMessage('could not create account');
        }
    });

    const loginMutation = useMutation({
        mutationFn: async ({username, password}: {username: string, password: string}) => {
            const response = await fetch(
                urls.login,
                {
                    ...defaultFetchOptions,
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                }
            );

            if (!response.ok) {
                throw new Error(`Login failed with status ${response.status}`);
            }

            return response;
        },
        onSuccess: () => setIsLoggedIn(true),
        onError: () => {
            setErrorMessage('could not log in');
            throw new Error('could not log in');
        },
    });

    return {
        loginMutation,
        createAccount,
        logoutMutation,
    }
}