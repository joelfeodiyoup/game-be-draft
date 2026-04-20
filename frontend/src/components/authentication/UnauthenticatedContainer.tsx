import { useState } from "react";
import { Login } from "./Login";
import { CreateAccount } from "./CreateAccount";

export const UnauthenticatedContainer = () => {
    const [option, setOption] = useState<'create' | 'login' | null>(null);

    return <>
    {(option === null || option === 'login') && 
        <>
        <a href="#" onClick={() => setOption('create')}>&lt; create</a>
        <br />
        <Login />
        </>
    }
    {option === 'create' &&
    <>
    <a href="#" onClick={() => setOption('login')}>&lt; login</a>
    <br />
    <CreateAccount />
    </>}
    </>
}