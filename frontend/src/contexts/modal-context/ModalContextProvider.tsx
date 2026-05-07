import { ModalLayout } from "@/layouts/ModalLayout"
import { ModalContext } from "./ModalContext"
import { useCallback, useState } from "react"

export const ModalContextProvider = ({children}: {children: React.ReactNode}) => {
    const [modal, setModal] = useState<React.ReactNode | null>();
    const showModal = useCallback((modal: React.ReactNode) => {
        setModal(modal);
    }, []);

    const hideModal = useCallback(() => setModal(null), []);

    return <ModalContext.Provider value={{showModal, hideModal}}>
        {children}
        {modal && <ModalLayout>{modal}</ModalLayout>}
    </ModalContext.Provider>
}