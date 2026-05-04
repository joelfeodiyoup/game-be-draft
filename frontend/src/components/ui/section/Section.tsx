import { useState } from 'react';
import styles from './Section.module.scss';
import { Button } from '../button/Button';
import { Cluster } from '../cluster/Cluster';

export const Section = ({title, children}: {title: string, children: React.ReactNode}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return <div className={styles.section}>
        <Cluster>
            <h2 className={styles.title}>{title}</h2>
            <Button onClick={() => setIsCollapsed(collapsed => !collapsed)}>{isCollapsed ? '+' : '-'}</Button>
        </Cluster>
        <div className={[styles['children-container'], ...(isCollapsed ? [styles.collapsed] : [])].join(' ')}>
            {children}
        </div>
    </div>
}