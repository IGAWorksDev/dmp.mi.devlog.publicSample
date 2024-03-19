import React from "react";

export interface ModalInfo {
    key: string;
    Component: React.FC<any>;
    props: unknown;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

export default class ModalController {
    private flagState;
    private modalInfos: ModalInfo[] = [];

    constructor(flagState: any) {
        this.flagState = flagState
    }

    private flush() {
        // rerender 용도
        const [_, setFlag] = this.flagState;
        setFlag((prev: number) => prev + 1);
    }

    get top() {
        return this.modalInfos[this.modalInfos.length - 1];
    }

    private handlePromise(key: string, resolver: (v: any) => void, value: string) {
        resolver(value);
        this.modalInfos = this.modalInfos.filter(({key: _key}) => key !== _key);
        this.flush();
    }

    clear() {
        while (this.modalInfos.length) this.pop();
        this.flush();
    }

    pop() {
        this.top.reject("close Modal");
        this.modalInfos.pop();
        this.flush();
    }

    async push(key: string, Component: React.FC<any>, props: unknown) {
        return new Promise((resolve, reject) => {
            this.modalInfos.push({
                key,
                Component,
                props,
                resolve: (value) => this.handlePromise(key, resolve, value),
                reject: (reason) => this.handlePromise(key, reject, reason)
            });
            this.flush();
        })
    }
}