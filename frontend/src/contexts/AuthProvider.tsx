import { useCallback, useState } from "react";
import { AuthContext } from "./AuthContext";

function getIsLoggedIn(): boolean {
    return document.cookie.includes('isLoggedIn=true');
}

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => getIsLoggedIn());

    const updateLoginState = useCallback((isLoggedIn: boolean) => setIsLoggedIn(isLoggedIn), []);

    return <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn: updateLoginState}}>{children}</AuthContext.Provider>
}