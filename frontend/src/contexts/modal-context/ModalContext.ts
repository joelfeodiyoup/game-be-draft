type ModalContextType = {
    showModal: (content: React.ReactNode) => void;
    hideModal: () => void;
  }


  import { createContext, useContext } from "react";

export const ModalContext = createContext<ModalContextType>({
    showModal: (_content) => {},
    hideModal: () => {}
});

export const useModalContext = () => useContext(ModalContext);