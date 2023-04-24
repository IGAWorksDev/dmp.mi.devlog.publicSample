import React from "react";
import './App.scss';
import {observer} from "mobx-react";
import Game from "./sample/Game";

@observer
export default class App extends React.Component<any, any>{

    constructor(props:any) {
        super(props);
    }

    render() {
        return (
            <article className="App">
                {/*<header className="App-header">*/}
                {/*    <h1>Component Game</h1>*/}
                {/*</header>*/}
                <div className={'game-wrapper'}>
                    <Game/>
                </div>
            </article>
        );
    }

}

