import React from 'react';
import './Message.scss'

enum BuilderType {
    Message = 'message',
    Notify = 'notify'
}

interface MessageList {
    node: HTMLElement;
    marginTop: number;
}

const DEFAULT_MARGIN = 10
const DEFAULT_DELAY = 2000

class MessageBuilder {

    private readonly rootElement: HTMLDivElement;
    private readonly type: BuilderType;
    private messageList: MessageList[] = [];
    private readonly defaultMargin: number = 0;

    constructor(type: BuilderType) {
        this.type = type;
        this.defaultMargin = this.type === BuilderType.Message ? DEFAULT_MARGIN : 0
        const divElement = document.createElement('div');
        divElement.className = `message-container ${type}`;
        document.body.appendChild(divElement);
        this.rootElement = divElement;
    }

    public show = (message: string) => {
        const innerElement = document.createElement('p');
        innerElement.className = `message-text ${this.type} fade-in`;
        if (this.type === BuilderType.Message) {
            innerElement.innerHTML = message;
        } else {
            const cancelElement = document.createElement('button')
            cancelElement.innerHTML = '✖';
            cancelElement.onclick = () => this.removeMessage(innerElement)
            const spanElement = document.createElement('span');
            spanElement.innerHTML = message;
            innerElement.appendChild(spanElement);
            innerElement.appendChild(cancelElement);
        }

        this.rootElement.appendChild(innerElement);
        const newList: MessageList = {
            node: innerElement,
            marginTop: this.messageList.length * innerElement.clientHeight +
                (this.defaultMargin * (this.messageList.length + 1))
        }
        innerElement.style.marginTop = `${newList.marginTop}px`
        this.messageList.push(newList);

        if (this.type === BuilderType.Message) {
            setTimeout(() => innerElement.className = `message-text fade-out`, DEFAULT_DELAY - 230)
            setTimeout(() => this.removeMessage(innerElement), DEFAULT_DELAY);
        }
    }

    private removeMessage = (element: any) => {
        const height = element.clientHeight;
        element.remove();
        if (this.type === BuilderType.Message) {
            this.messageList.shift();
        } else {
            const index = this.messageList.findIndex((a) => a.node === element)
            this.messageList.splice(index, 1);
        }
        this.messageList = this.messageList.map((a, i) => {
            return {
                node: a.node,
                marginTop: i * height + (this.defaultMargin * (i + 1))
            }
        })
        this.messageList.forEach((a) => {
            a.node.style.marginTop = `${a.marginTop}px`
        })
    }

}

export const Message = new MessageBuilder(BuilderType.Message);
export const Notify = new MessageBuilder(BuilderType.Notify);