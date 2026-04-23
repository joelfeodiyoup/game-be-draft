import { createContext, useContext } from "react";

export const ErrorContext = createContext<{
    errorMessage: string;
    setErrorMessage: (errorMessage: string) => void;
}>({errorMessage: '', setErrorMessage: () => {}});

export const useErrorContext = () => useContext(ErrorContext);