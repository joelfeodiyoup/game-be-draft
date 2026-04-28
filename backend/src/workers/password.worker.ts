import bcrypt from 'bcrypt';

export const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
}

export const verifyPassword = (args: {password: string, hash: string}): boolean => {
    return bcrypt.compareSync(args.password, args.hash);
}