import styles from './Button.module.scss';

type ButtonProps = React.ComponentPropsWithoutRef<'button'>;
export const Button = ({children, ...props}: ButtonProps) => {
    return <button {...props} className={[props.className, styles.button].join(' ')}>{children}</button>
}