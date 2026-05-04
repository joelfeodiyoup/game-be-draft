import type { paths } from '@/lib/api-types';

type ApiResponse<T extends keyof paths, Method extends keyof paths[T]> = 
    paths[T][Method] extends { responses: { 200: { content: { 'application/json': infer R } } } }
        ? R
        : never;

export type Game = ApiResponse<'/games/{gameId}', 'get'>;
export type GamesList = ApiResponse<"/games", "get">;

export type Scenarios = ApiResponse<'/games/{gameId}/scenarios', 'get'>
export type Scenario = Scenarios[0];