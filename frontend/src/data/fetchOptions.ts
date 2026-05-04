export const defaultFetchOptions: RequestInit = {
    credentials: 'include',
    headers: {
        "Content-Type": 'application/json'
    }
}

// const baseUrl = 'http://localhost:3000';
// export const urls = {
//     login: `${baseUrl}/auth/login`,
//     createAccount: `${baseUrl}/auth/register`,
//     logout: `${baseUrl}/auth/logout`,

//     getGames: `${baseUrl}/games`,
//     getGame: (id: string) => `${baseUrl}/games/${id}`,
//     getScenarios: ({gameId}: {gameId: string}) => `${baseUrl}/games/${gameId}/scenarios`,

//     startNewScenario: ({gameId, scenarioId}: {gameId: string, scenarioId: string}) => `${baseUrl}/games/${gameId}/scenarios/${scenarioId}/start-new`,
//     createScenario: ({gameId}: {gameId: string}) => `${baseUrl}/games/${gameId}/scenarios`,

//     rateGame: ({gameId}: {gameId: string}) => `${baseUrl}/games/${gameId}/ratings`,
// }