import { useCallback, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function getIsLoggedIn(): boolean {
    return document.cookie.includes('isLoggedIn=true');
}

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => getIsLoggedIn());
    const [user, setUser] = useState('');

    const { refetch: refetchUser } = useQuery({
        queryFn: async () => {
            const { data } = await api.GET('/auth/user');
            if (!data) {
                throw new Error('error');
            }
            setUser(data?.name);

            return data;
        },
        enabled: isLoggedIn,
        queryKey: ['auth-user', isLoggedIn],
    });

    const updateLoginState = useCallback((isLoggedIn: boolean) => {
        setIsLoggedIn(isLoggedIn);
        if (isLoggedIn) refetchUser();
    }, [refetchUser]);


    return <AuthContext.Provider value={{username: user, isLoggedIn, setIsLoggedIn: updateLoginState}}>{children}</AuthContext.Provider>
}