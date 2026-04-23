import styles from './HeaderLayout.module.scss';

type HeaderLayoutProps = {
    title: React.ReactNode;
    authSection: React.ReactNode;
}
export const HeaderLayout = ({title, authSection}: HeaderLayoutProps) => {
    return <section className={styles['header-section']}>
        <header className={styles.title}>{title}</header>
        <nav className={styles['auth-section']}>{authSection}</nav>
        </section>
}