import React, {CSSProperties} from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './Alert.scss'

export interface AlertOption {
    title?: string;
    message?: string;
    onConfirm?: () => void;
    style?: CSSProperties;
}

class AlertBuilder {

    private rootElement?: HTMLDivElement;

    private removeMessage = () => {
        this.rootElement?.remove();
        this.rootElement = undefined;
    };

    public show = (option: AlertOption) => {
        const {message, title, onConfirm} = option;
        this.removeMessage();
        const divElement = document.createElement('div');
        divElement.className = `alert-container`;
        document.body.appendChild(divElement);
        this.rootElement = divElement;
        const root = ReactDOMClient.createRoot(this.rootElement);
        root.render(<AlertModal title={title}
                                message={message}
                                onConfirm={onConfirm}
                                onRemove={this.removeMessage}/>)
    }
}

export const Alert = new AlertBuilder();

interface AlertModalProps {
    title?: string;
    message?: string
    onConfirm?: () => void;
    onRemove: () => void;
    style?: CSSProperties;
}

class AlertModal extends React.Component<AlertModalProps, any> {
    render() {
        const {title, message, onConfirm, onRemove} = this.props;
        return (
            <article className={'alert'} onClick={onRemove}>
                <section onClick={e => e.stopPropagation()}>
                    {title && <header>{title}</header>}
                    <div>
                        {message ? message : '내용 없음'}
                    </div>
                    <footer>
                        <button onClick={onRemove}>취소</button>
                        <button onClick={() => {
                            onConfirm && onConfirm();
                            onRemove();
                        }}>확인
                        </button>
                    </footer>
                </section>
            </article>
        );
    }
}
