import styles from './AppLayout.module.scss';

type AppLayoutProps = {header: React.ReactNode, error?: React.ReactNode; left: React.ReactNode, main: React.ReactNode, right: React.ReactNode};
export const AppLayout = ({header, error, left, main, right}: AppLayoutProps) => {
    return <section className={styles.layout}>
        <header className={styles.header}>{header}</header>
        {error && <div className={styles.error}>{error}</div>}
        <aside className={styles.left}>{left}</aside>
        <main className={styles.main}>{main}</main>
        <aside className={styles.right}>{right}</aside>
    </section>
}