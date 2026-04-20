export const defaultFetchOptions: RequestInit = {
    credentials: 'include'
}

const baseUrl = 'http://localhost:3000';
export const urls = {
    login: `${baseUrl}/auth/login`,
    createAccount: `${baseUrl}/auth/register`,
    logout: `${baseUrl}/auth/logout`,
}