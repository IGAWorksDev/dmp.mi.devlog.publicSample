import ModalContext from "./ModalContext";
import  {useState} from "react";
import ModalController from "./ModalController";
import ModalContainer from "./ModalContainer";

export function ModalProvider({children}:{children:any}) {
    const flagState= useState(1);
    const [modalController] = useState(()=>new ModalController(flagState));

    return <ModalContext.Provider value={modalController as any}>
        <>{children}</>
        <ModalContainer/>
    </ModalContext.Provider>
}