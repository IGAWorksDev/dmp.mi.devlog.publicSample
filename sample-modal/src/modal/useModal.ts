import {useContext} from "react";
import ModalContext from "./ModalContext";

export const useModal = () => {
    const context = useContext(ModalContext);
    if(!context) throw new Error("Need to registser ModalProvier");
    return context
}