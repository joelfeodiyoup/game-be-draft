import { useState, useEffect, useRef } from "react";
import { ErrorContext } from "./ErrorContext";

const ERROR_TIMEOUT_MS = 5000; // 5 seconds

export const ErrorContextProvider = ({children}: {children: React.ReactNode}) => {
    const [errorMessage, setErrorMessage] = useState('');
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout to clear the error if there's an error message
        if (errorMessage) {
            timeoutRef.current = window.setTimeout(() => {
                setErrorMessage('');
                timeoutRef.current = null;
            }, ERROR_TIMEOUT_MS);
        }

        // Cleanup on unmount or when errorMessage changes
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [errorMessage]);

    return <ErrorContext.Provider value={{errorMessage, setErrorMessage}}>{children}</ErrorContext.Provider>
}