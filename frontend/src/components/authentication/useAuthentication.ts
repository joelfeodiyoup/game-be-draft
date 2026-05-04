import { useAuthContext } from "@/contexts/AuthContext";
import { useErrorContext } from "@/contexts/ErrorContext";
import { defaultFetchOptions } from "@/data/fetchOptions";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuthentication = () => {
    const { setIsLoggedIn } = useAuthContext();
    const { setErrorMessage } = useErrorContext();
    const queryClient = useQueryClient();

    const logoutMutation = useMutation({
        mutationFn: async () => {
            const { response } = await api.POST('/auth/logout', {
                ...defaultFetchOptions,
                method: 'POST',
                body: undefined,
            });

            return response;
        },
        onSuccess: () => {
            setIsLoggedIn(false);
            queryClient.clear();
        },
        onError: () => {
            setErrorMessage('error while logging out');
        }
    });

    const createAccount = useMutation({
        mutationFn: (credentials: {username: string, password: string}) => api.POST('/auth/register', {
            method: 'POST',
            body: credentials
        }),
        onError: () => {
            setErrorMessage('could not create account');
        }
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: {username: string, password: string}) => {
            const { data, response } = await api.POST(
                '/auth/login',
                {
                    method: 'POST',
                    body: credentials
                }
            );

            if (!response.ok) {
                throw new Error(`Login failed with status ${response.statusText}`);
            }

            return data;
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