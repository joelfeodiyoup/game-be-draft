export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthSession {
    sessionId: string;
    playerId: string;
    expiresAt: Date;
}