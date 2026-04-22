export function disallowInProduction(operation?: string): void {
    const allowedEnvs = ['development', 'test', 'local'];
    const env = process.env.NODE_ENV?.toLowerCase() || 'unknown';

    // Fail-safe: if NODE_ENV is unset or unknown, assume production
    if (!allowedEnvs.includes(env)) {
        throw new Error(
            `${operation ?? '(unknown operation)'} is not allowed in production environment ` +
            `(NODE_ENV=${process.env.NODE_ENV || 'unset'})`
        );
    }
}