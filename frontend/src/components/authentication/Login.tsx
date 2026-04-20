import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { defaultFetchOptions, urls } from "../../data/fetchOptions";
import { useAuthContext } from "../../contexts/AuthContext";

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { setIsLoggedIn } = useAuthContext();

    const login = useMutation({
        mutationFn: ({username, password}: {username: string, password: string}) => {
            return fetch(
                urls.login,
                {
                    ...defaultFetchOptions,
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                }
            )
        },
        onSuccess: () => setIsLoggedIn(true)
    })

    return <>
        <h2>Login</h2>
        <label>
            username:
            <input type="text" onChange={event => setUsername(event.target.value)}/>
        </label>
        <label>
            password:
            <input type="password" onChange={event => setPassword(event.target.value)}/>
        </label>
        <button type="button" onClick={() => login.mutate({username, password})}>login</button>
    </>
}