import { createElement } from 'react';
import styles from './Title.module.scss';

type TitleProps = {
    level?: 1 | 2 | 3;
    text: string
}
export const Title = ({text, level = 1}: TitleProps) => {
    const tag = `h${level}` as 'h1' | 'h2' | 'h3';

    return createElement(tag, { className: styles.title}, text);
}