import { useModalContext } from '@/contexts/modal-context/ModalContext';
import styles from './ModalLayout.module.scss';
import { Button } from '@/components/ui/button/Button';

export const ModalLayout = ({children}: {children: React.ReactNode}) => {
    const { hideModal } = useModalContext();
    return <div className={styles.modal}>
        <div className={styles.content}>
            <Button className={styles['close-button']} onClick={hideModal}>X</Button>
            {children}
        </div>
    </div>
}