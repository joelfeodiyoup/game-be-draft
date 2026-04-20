import { createContext, useContext } from "react";

export const AuthContext = createContext<{
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}>({isLoggedIn: false, setIsLoggedIn: () => {}});

export const useAuthContext = () => useContext(AuthContext);