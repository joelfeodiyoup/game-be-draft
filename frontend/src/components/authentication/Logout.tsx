import { useMutation } from "@tanstack/react-query"
import { defaultFetchOptions, urls } from "../../data/fetchOptions";
import { useAuthContext } from "../../contexts/AuthContext";

export const Logout = () => {
    const { setIsLoggedIn } = useAuthContext();

    const logout = useMutation({
        mutationFn: () => fetch(urls.logout, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify({})
        }),
        onSuccess: () => setIsLoggedIn(false)
    });
    return <button onClick={() => logout.mutate()}>log out</button>
}