import React from 'react';
import {observer} from "mobx-react";
import {action, makeObservable, observable} from "mobx";
// @ts-ignore
import Ship from './image/ship.svg'

enum MultiKeyCode {
    left = 1,
    right = 2,
    up = 4,
    down = 8
}

enum DotDirection {
    LEFT,
    RIGHT,
    TOP,
    BOTTOM
}

const BLOCK_SPEED = 3;
const BLOCK_SIZE = 20;
const SPEED_MAX = 2;
const DOT_SIZE = 2;

@observer
export default class Game extends React.Component<any, any> {

    private readonly gameRef = React.createRef<HTMLElement>()
    private readonly canvasRef = React.createRef<HTMLCanvasElement>();

    private offCanvas: HTMLCanvasElement = document.createElement("canvas");

    private keyPress: number = 0;
    private timer: any = undefined;
    @observable
    private size = 0;
    @observable
    private block: { x: number, y: number } = {x: 50, y: 50};
    private ship: any;
    @observable
    private dotList: Dot[] = [];
    private cnt: number = 0;
    @observable
    private isCrash: boolean = false;

    constructor(props: any) {
        super(props);
        makeObservable(this);
    }


    componentDidMount() {
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('resize', this.setSize);
        this.setSize();
        this.initResource();
        this.onDraw();

    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('resize', this.setSize);
        cancelAnimationFrame(this.timer);
    };

    private createImage = (resource: any) => {
        const i = new Image();
        i.src = resource;
        return i;
    };

    private initResource = () => {
        this.ship = this.createImage(Ship)
    }

    @action
    private setSize = () => {
        const size = Math.floor(this.gameRef.current?.getBoundingClientRect().width || 0);
        this.size = size
        this.block = {x: size / 2, y: size / 2}
        this.offCanvas.width = size;
        this.offCanvas.height = size;
    }

    private onKeyUp = (e: KeyboardEvent) => {
        e.stopPropagation();
        switch (e.key) {
            case "ArrowUp":
                this.keyPress ^= MultiKeyCode.up;
                break;
            case "ArrowDown":
                this.keyPress ^= MultiKeyCode.down;
                break;
            case "ArrowLeft":
                this.keyPress ^= MultiKeyCode.left;
                break;
            case "ArrowRight":
                this.keyPress ^= MultiKeyCode.right;
                break;
        }
    }

    private onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        switch (e.key) {
            case "ArrowUp":
                this.keyPress |= MultiKeyCode.up;
                break;
            case "ArrowDown":
                this.keyPress |= MultiKeyCode.down;
                break;
            case "ArrowLeft":
                this.keyPress |= MultiKeyCode.left;
                break;
            case "ArrowRight":
                this.keyPress |= MultiKeyCode.right;
                break;
            case "Enter":
                this.handleRestart();
                break;
        }
    }

    private controlMove = () => {
        const {keyPress} = this;
        if (keyPress & MultiKeyCode.up) {
            this.block.y < BLOCK_SIZE ? this.block.y = BLOCK_SIZE / 2 : this.block.y -= BLOCK_SPEED;
        }
        if (keyPress & MultiKeyCode.down) {
            this.block.y > this.size - BLOCK_SIZE ? this.block.y = this.size - BLOCK_SIZE / 2 : this.block.y += BLOCK_SPEED;
        }
        if (keyPress & MultiKeyCode.left) {
            this.block.x < BLOCK_SIZE ? this.block.x = BLOCK_SIZE / 2 : this.block.x -= BLOCK_SPEED;
        }
        if (keyPress & MultiKeyCode.right) {
            this.block.x > this.size - BLOCK_SIZE ? this.block.x = this.size - BLOCK_SIZE / 2 : this.block.x += BLOCK_SPEED;
        }
    }

    private rand = (range: number = 10, offset: number = 0) => {
        return Math.floor(Math.random() * range) + offset;
    };


    @action
    private createDot = () => {
        const {size} = this;
        this.cnt < 2000 ? this.cnt++ : this.cnt = 0
        const dot = new Dot();
        dot.direction = this.rand(4);

        dot.speedX = this.rand(SPEED_MAX, 1);
        dot.speedY = this.rand(SPEED_MAX, 1);

        switch (dot.direction) {
            case DotDirection.LEFT:
                dot.y = this.rand(size - DOT_SIZE);
                dot.speedY *= dot.y < size / 2 ? 1 : -1;
                break;
            case DotDirection.TOP:
                dot.x = this.rand(size - DOT_SIZE);
                dot.speedX *= dot.x < size / 2 ? 1 : -1;
                break;
            case DotDirection.RIGHT:
                dot.x = size - DOT_SIZE;
                dot.y = this.rand(size - DOT_SIZE);
                dot.speedY *= dot.y < size / 2 ? 1 : -1;
                break;
            case DotDirection.BOTTOM:
                dot.x = this.rand(size - DOT_SIZE);
                dot.speedX *= dot.x < size / 2 ? 1 : -1;
                dot.y = size;
                break;
        }
        if (this.cnt % 20 === 0) {
            this.dotList = [...this.dotList, dot];
        }
    };

    private renderDot = (offCtx: any) => {
        const {dotList} = this;
        offCtx.fillStyle = 'red';
        for (let i = 0; i < this.dotList.length; i++) {
            const dot = dotList[i];
            offCtx.beginPath();
            offCtx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
            offCtx.stroke();
            offCtx.fill();
        }
    }

    private updateDot = () => {
        const {size} = this;
        this.dotList = this.dotList.reduce((all: Dot[], dot: Dot) => {
            const speedX = dot.speedX;
            const speedY = dot.speedY;
            switch (dot.direction) {
                case DotDirection.LEFT:
                    dot.x += speedX;
                    dot.y += speedY;
                    if (dot.x > size - DOT_SIZE) {
                        return all;
                    }
                    break;
                case DotDirection.TOP:
                    dot.x += speedX;
                    dot.y += speedY;
                    if (dot.y > size - DOT_SIZE) {
                        return all;
                    }
                    break;
                case DotDirection.RIGHT:
                    dot.x -= speedX;
                    dot.y += speedY;
                    if (dot.x < 0) {
                        return all;
                    }
                    break;
                case DotDirection.BOTTOM:
                    dot.x += speedX;
                    dot.y -= speedY;
                    if (dot.y < 0) {
                        return all;
                    }
                    break;
            }

            all.push(dot);
            return all;
        }, []);
    }

    @action
    private handleCrash = () => {
        const {block} = this;
        this.dotList.forEach((a) => {
            const x = Math.max(a.x, block.x) - Math.min(a.x, block.x);
            const y = Math.max(a.y, block.y) - Math.min(a.y, block.y);
            const distance = Math.sqrt(x * x + y * y)
            if (distance <= BLOCK_SIZE / 2 + DOT_SIZE / 2) {
                this.isCrash = true;
            }
        })
    }

    private drawOver = (ctx: any) => {
        const {size} = this;
        let color = '#080808';
        ctx.beginPath()
        ctx.shadowColor = 'transparent'
        ctx.font = "30px Arial";
        ctx.fillStyle = color;
        ctx.fillText("GAME OVER", size / 2 - 80, size / 2);
        ctx.fillText("PRESS ENTER", size / 2 - 90, size / 2 + 30);
        ctx.closePath();
    }

    @action
    private handleRestart = () => {
        if (this.isCrash) {
            this.isCrash = false;
            this.dotList = [];
            this.onDraw();
        }
    }

    private getRotateDegree = () => {
        const {keyPress} = this
        switch (keyPress) {
            case MultiKeyCode.up:
                return 0
            case MultiKeyCode.up + MultiKeyCode.right:
                return 45
            case MultiKeyCode.right:
                return 90
            case MultiKeyCode.right + MultiKeyCode.down:
                return 135
            case MultiKeyCode.down:
                return 180
            case MultiKeyCode.down + MultiKeyCode.left:
                return 225
            case MultiKeyCode.left:
                return 270
            case MultiKeyCode.left + MultiKeyCode.up:
                return 315
            default:
                return 0
        }
    }

    private renderShip = (offCtx: any) => {
        const {keyPress,getRotateDegree} = this;
        // offCtx.drawImage(this.ship, this.block.x - BLOCK_SIZE / 2, this.block.y - BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
        offCtx.save();

        // offCtx.rotate(getRotateDegree()*(Math.PI/180));
        // switch (keyPress) {
        //     case MultiKeyCode.up:
        //         offCtx.rotate(getRotateDegree()*(Math.PI/180));
        //         offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        //         break;
        //     case MultiKeyCode.up + MultiKeyCode.right:
        //         return 45
        //     case MultiKeyCode.right:
        //         offCtx.rotate(90*(Math.PI/180));
        //         offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        //         break;
        //     case MultiKeyCode.right + MultiKeyCode.down:
        //         return 135
        //     case MultiKeyCode.down:
        //         offCtx.rotate(getRotateDegree()*(Math.PI/180));
        //         offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        //         break;
        //     case MultiKeyCode.down + MultiKeyCode.left:
        //         return 225
        //     case MultiKeyCode.left:
        //         offCtx.rotate(getRotateDegree()*(Math.PI/180));
        //         offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        //         break;
        //     case MultiKeyCode.left + MultiKeyCode.up:
        //         return 315
        //     default:
        //         return 0
        // }










        offCtx.translate(this.block.x, this.block.y)
        if ((keyPress & MultiKeyCode.up) || (keyPress === 0)) {
            offCtx.rotate(0);
            // offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        }else if (keyPress & MultiKeyCode.down) {
            offCtx.rotate(180*(Math.PI/180));
            // offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        }else if (keyPress & MultiKeyCode.left) {
            offCtx.rotate(270*(Math.PI/180));
            // offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        } else if (keyPress & MultiKeyCode.right) {
            offCtx.rotate(90*(Math.PI/180));
            // offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        }
        offCtx.drawImage(this.ship, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
        offCtx.restore();
    }


    private onDraw = () => {

        if (!this.canvasRef.current) {
            return;
        }

        const offCtx = this.offCanvas.getContext("2d");

        if (!offCtx) {
            return;
        }

        offCtx.clearRect(0, 0, this.size, this.size);

        this.controlMove();
        // this.createDot();
        // this.updateDot();
        // this.renderDot(offCtx);
        // this.handleCrash();

        // offCtx.drawImage(this.ship, this.block.x - BLOCK_SIZE / 2, this.block.y - BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
        this.renderShip(offCtx);

        this.isCrash && this.drawOver(offCtx)
        const ctx = this.canvasRef.current.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.size, this.size);
            ctx.drawImage(offCtx.canvas, 0, 0);
        }
        this.timer = requestAnimationFrame(this.onDraw);
        if (this.isCrash) {
            cancelAnimationFrame(this.timer);
        }
    }

    render() {
        const {size} = this;
        return (
            <article className={'game'} ref={this.gameRef}>
                <canvas ref={this.canvasRef} width={size} height={size} style={{background: "beige"}}>
                    캔버스를 지원하지 않는 브라우저 입니다.
                </canvas>
            </article>
        );
    }
}

class Dot {
    direction: DotDirection = DotDirection.LEFT;
    x: number = 0;
    y: number = 0;
    speedX: number = 1;
    speedY: number = 1;
}