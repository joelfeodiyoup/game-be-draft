import styles from './Section.module.scss';

export const Section = ({title, children}: {title: string, children: React.ReactNode}) => {
    return <div className={styles.section}>
        <h2 className={styles.title}>{title}</h2>
        {children}
    </div>
}