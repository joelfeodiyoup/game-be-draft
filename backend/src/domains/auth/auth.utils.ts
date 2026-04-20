import bcrypt from 'bcrypt';

export function hash(input: string): string {
    return bcrypt.hashSync(input, 10);
}

export function compareToHash(unverified: string, hashed: string): boolean {
    return bcrypt.compareSync(unverified, hashed);
}