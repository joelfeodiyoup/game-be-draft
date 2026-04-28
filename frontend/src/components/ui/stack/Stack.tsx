export const Stack = ({children}: {children: React.ReactNode}) => {
    return <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>{children}</div>
}