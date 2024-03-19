import './App.css'
import {ModalProvider} from "./modal/ModalProvider";
import Page from "./page/Page";

function App() {

  return (
    <>
        <ModalProvider>
            <Page/>
        </ModalProvider>

    </>
  )
}

export default App
