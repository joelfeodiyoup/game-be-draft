import { classes } from "@/utils/styling.utils";
import styles from "./FormField.module.scss";

type FormFieldOptions = {
    orientation?: "vertical" | "horizontal"
}
const defaultFormFieldOptions: Required<FormFieldOptions> = {
    orientation: 'vertical',
}
export const FormField = ({label, input, options}: {label: string, input: React.ReactNode, options?: FormFieldOptions}) => {
    const appliedOptions = {...defaultFormFieldOptions, ...options};
    return <label className={classes(styles['form-field'], [styles['horizontal'], appliedOptions.orientation === 'horizontal'])}>
        {label}
        {input}</label>
}