import { useState } from "react";
import { Tabs } from "./Tabs";
import { FormField } from "../ui/form-field/FormField";
import { useAuthentication } from "./useAuthentication";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "../ui/button/Button";

export const Authentication = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const {logoutMutation, loginMutation, createAccount} = useAuthentication();

    const { isLoggedIn } = useAuthContext();

    if (isLoggedIn) {
        return <Button onClick={() => logoutMutation.mutate()}>log out</Button>
    }

    return <Tabs
        tabs={[
            {title: 'login', content: <form><FormField
                label="username"
                input={<input name="username" autoComplete="username" type="text" onChange={event => setUsername(event.target.value)} />}
                options={{orientation: 'horizontal'}}
                />
            <FormField
                label="password"
                input={<input name="password" autoComplete="current-password" type="password" onChange={event => setPassword(event.target.value)}/>}
                options={{orientation: 'horizontal'}}
            />
            <Button type="button" onClick={() => loginMutation.mutate({username, password})}>login</Button></form>},
            {title: 'create', content: <form><FormField
                options={{orientation: 'horizontal'}}
                label="username"
                input={
                    <input type="text" onChange={event => setUsername(event.target.value)} />
                } />
                <FormField
                    options={{orientation: 'horizontal'}}
                    label="password"
                    input={
                        <input type="password" onChange={event => setPassword(event.target.value)} />
                    }
                />
            <Button onClick={() => createAccount.mutate({username, password})}>create account</Button></form>},
        ]}
     />
}

