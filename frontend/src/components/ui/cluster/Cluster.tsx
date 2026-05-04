export const Cluster = ({children, ...props}: {children: React.ReactNode} & React.ComponentPropsWithoutRef<'div'>) => {
    return <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '0.5rem',
        ...(props.style ?? {})
    }}>{children}</div>
}