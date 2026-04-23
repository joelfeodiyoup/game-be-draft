import { useState } from "react";
import styles from './Tabs.module.scss';
import { classes } from "@/utils/styling.utils";

type TabsProps = {
    tabs: {title: React.ReactNode; content: React.ReactNode;}[];
    initiallyOpenTabIndex?: number;
}
export const Tabs = ({tabs, initiallyOpenTabIndex = 0}: TabsProps) => {
    const [openTabIndex, setOpenTabIndex] = useState(initiallyOpenTabIndex);

    return <div className={styles.tabs}>
        <div>{tabs.map((tab, index) => <span className={
            classes(openTabIndex === index ? styles['is-open'] : '',
                styles.tab
            )
            }  onClick={() => setOpenTabIndex(index)}>{tab.title}</span>)}</div>
        <div className={styles.content}>{tabs[openTabIndex].content}</div>
    </div>
}