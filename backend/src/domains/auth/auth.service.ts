// all business logic - auth flow, password hashing, session creation

import { AuthSession, LoginCredentials } from "./auth.types";
import { compareToHash, hash } from "./auth.utils";
import { playerRepository } from "../../repositories/player.repository";
import { authSessionRepository } from "../../repositories/auth-session.repository";

/** create new player with hashed password */
export async function register(credentials: LoginCredentials) {
    // catch 'user already exists' (thrown at DB from uniqueness)
    // catch password complexity (implement in some function)

    // hash password
    const hashedPassword = hash(credentials.password);
    // create new row in Players table
    playerRepository.create({ username: credentials.username, password_hash: hashedPassword});
}

/** validates credentials, create session */
export async function login(credentials: LoginCredentials) {
    // catch 'incorrect password' (DB record not found)

    // find user by username in Player table
    const player = await playerRepository.findByUsername({username: credentials.username});
    if (!player) { return }
    // check if it matches
    const passwordMatches = compareToHash(credentials.password, player?.password_hash);
    if (!passwordMatches) { return }
    // if not, return some error, otherwise...
    // create new 'session' in table
    const session = await authSessionRepository.create({
        player: { connect: {id: player.id }},
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 1)
    })
    // return result to user
    return session;
}

/** invalidate session */
export async function logout({sessionId}: Pick<AuthSession, 'sessionId'>) {
    // silently catch 'sessionId not found'.

    // delete the session
    const result = await authSessionRepository.delete({id: sessionId})
    // return result
    return result;
}

/** check if session is valid and not expired */
export async function validateSession({sessionId}: Pick<AuthSession, 'sessionId'>) {
    // catch 'sessionId not found'

    // search Sessions by session Id
    const session = await authSessionRepository.findById({id: sessionId});
    if (!session) { return }
    // check if session is valid
    if (session.expires_at.getMilliseconds() < Date.now()) {
        return logout({sessionId});
    }
    // return result
    return session;
}

/** extend session expiry */
function refreshSession(sessionId: Pick<AuthSession, 'sessionId'>) {
    // catch 'sessionID not found' -> user needs to login again
    // if session is already expired, then refresh is not possible. user needs to login again

    // search Sessions by session id
    // update session with increased 'expires_at'
    // return result
}