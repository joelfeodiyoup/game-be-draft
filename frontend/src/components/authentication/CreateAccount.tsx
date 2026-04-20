import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { defaultFetchOptions, urls } from "../../data/fetchOptions";

export const CreateAccount = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const createAccount = useMutation({
        mutationFn: (credentials: {username: string, password: string}) => fetch(urls.createAccount, {
            ...defaultFetchOptions,
            method: 'POST',
            body: JSON.stringify(credentials)
        })
    });

    return <>
        <h2>Create</h2>
        <label>
            username:
            <input type="text" onChange={event => setUsername(event.target.value)} />
        </label>
        <label>
            password:
            <input type="password" onChange={event => setPassword(event.target.value)} />
        </label>
        <button onClick={() => createAccount.mutate({username, password})}>create account</button>
    </>
}