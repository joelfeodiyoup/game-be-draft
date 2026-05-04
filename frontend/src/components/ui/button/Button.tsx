import styles from './Button.module.scss';

type ButtonProps = { isSelected?: boolean} & React.ComponentPropsWithoutRef<'button'>;
export const Button = ({children, isSelected = false, ...props}: ButtonProps) => {
    return <button {...props} className={[props.className, styles.button, ...(isSelected ? [styles['is-selected']] : [])].join(' ')}>{children}</button>
}