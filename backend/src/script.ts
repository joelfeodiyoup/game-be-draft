import { login, register } from "./domains/auth/auth.service";

async function main() {
    // register({username: 'joel', 'password': 'mypassword'})

    const session = await login({username: 'joel', password: 'mypassword'});
    console.log(session);
}

main().catch(console.error);