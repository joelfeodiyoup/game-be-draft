import createClient from "openapi-fetch";
import type { paths } from './api-types';
import { defaultFetchOptions } from "@/data/fetchOptions";

export const api = createClient<paths>({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    ...defaultFetchOptions,
    credentials: 'include',
});