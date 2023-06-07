import React from "react";
import './App.scss';
import {observer} from "mobx-react";
import GeoMap from "./sample/GeoMap";

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
                    맵입니다.
                    <GeoMap/>
                </div>
            </article>
        );
    }

}

