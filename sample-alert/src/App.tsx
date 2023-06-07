import React from "react";
import './App.scss';
import {observer} from "mobx-react";
import {Alert, AlertOption} from "./sample/alert/Alert";
import {Message, Notify} from "./sample/message/Message";

@observer
export default class App extends React.Component<any, any>{

    constructor(props:any) {
        super(props);
    }

    private clickAlert = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log('click')
        const alertOption: AlertOption = {
            title: 'test',
            message: 'test message',
            onConfirm: () => {
                console.log('click confirm')
            }
        }
        Alert.show(alertOption)
    }

    private clickMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        Message.show('message test')
    }
    private clickMessage2 = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        Message.show('message2 test')
    }
    private clickMessage3 = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        Message.show('message3 test')
    }

    private clickNotify = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        Notify.show('notify test')
    }
    private clickNotify2 = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        Notify.show('notify test2')
    }
    private clickNotify3 = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        Notify.show('notify test3')
    }

    render() {
        return (
            <article className="App">
                <div className={'alert-wrapper'}>
                    <div>
                        <h1>Alert</h1>
                        <button onClick={this.clickAlert}>alert</button>
                    </div>
                    <div>
                        <h1>Message</h1>
                        <button onClick={this.clickMessage}>message</button>
                        <button onClick={this.clickMessage2}>message2</button>
                        <button onClick={this.clickMessage3}>message3</button>
                    </div>
                    <div>
                        <h1>Notify</h1>
                        <button onClick={this.clickNotify}>notify</button>
                        <button onClick={this.clickNotify2}>notify2</button>
                        <button onClick={this.clickNotify3}>notify3</button>
                    </div>
                </div>
            </article>
        );
    }

}

