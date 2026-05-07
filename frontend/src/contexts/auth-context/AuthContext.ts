import { createContext, useContext } from "react";

export const AuthContext = createContext<{
    isLoggedIn: boolean;
    username: string;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}>({username: '', isLoggedIn: false, setIsLoggedIn: () => {}});

export const useAuthContext = () => useContext(AuthContext);