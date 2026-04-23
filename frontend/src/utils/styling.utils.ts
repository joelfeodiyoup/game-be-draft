export const classes = (...classNames: (string | [string, boolean])[]) => {
    return classNames.map(c => {
        if (typeof c === 'string') {
            return c;
        }
        if (c[1]) { return c[0]}
        return '';
    }).join(' ');
}