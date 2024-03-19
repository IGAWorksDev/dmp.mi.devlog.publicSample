import {useModal} from "../modal/useModal";
import {ModalInfo} from "../modal/ModalController";

interface TestProps extends ModalInfo {
    title : string;
}

function Test({resolve,reject}: TestProps) {
    return (
        <div>
            <button onClick={()=>resolve("hello")}>resolve</button>
            <button onClick={()=>reject("bye")}>reject</button>
        </div>
    )
}

export default function Page() {
    const modal = useModal() as any;
    const handleClick = async ()=>{
        const res = await modal.push('test',Test,{title:"yeriel"});
        alert(res)
    }
    return <button onClick={handleClick}></button>
}
