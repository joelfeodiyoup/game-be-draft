import { useState } from "react";
import { Button } from "../button/Button";
import styles from './ClippedString.module.scss';

const defaultClipLength = 40;
export const ClippedString = ({clipLength = defaultClipLength, children}: {clipLength?: number; children: React.ReactNode}) => {
    const nChars = children?.toString().length ?? 0;
    const shouldClip = nChars > clipLength;
    const [isExpanded, setIsExpanded] = useState(false);

    return <span>
            <span style={{maxWidth: `${clipLength}ch`}} className={[styles['clipped-string'], ...(!isExpanded ? [styles['clipped']] : [])].join(' ')}>{children}</span>
            {shouldClip && <Button onClick={() => setIsExpanded(expanded => !expanded)}>{isExpanded ? '-' : '+'}</Button>}
        </span>
}