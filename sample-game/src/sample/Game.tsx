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
    BOTTOM,
    SIZE
}


interface Dot {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
}

@observer
export default class Game extends React.Component {

    private readonly gameRef = React.createRef<HTMLElement>()
    private readonly canvasRef = React.createRef<HTMLCanvasElement>();

    private offCanvas: HTMLCanvasElement = document.createElement("canvas");

    private keyPress: number = 0;
    private timer: number = 0;
    private player: { x: number, y: number } = {x: 50, y: 50};
    private playerImageResource?: HTMLImageElement;
    private dotList: Dot[] = [];
    private isGameOver: boolean = false;

    @observable
    private screenSize = 0;

    constructor(props: any) {
        super(props);
        makeObservable(this);
    }

    componentDidMount() {
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('resize', this.updateScreenSize);

        this.init();
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.updateScreenSize);

        if (this.timer) {
            cancelAnimationFrame(this.timer);
        }
        this.timer = undefined;
    };

    private get option() {
        return {
            player: {
                speed: 3,
                size: 20
            },
            dot: {
                size: 2,
                maxSpeed: 4
            }
        }
    };

    private get playerAngle() {
        switch (this.keyPress) {
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
                return 0;
        }
    };

    private get dotSpeed() {
        const {maxSpeed} = this.option.dot;
        return this.rand(maxSpeed * 10, -maxSpeed / 2 * 10) / 10;
    };

    private init = () => {
        const i = new Image();
        i.src = Ship;
        i.onload = this.onDraw;
        this.playerImageResource = i;

        this.updateScreenSize();
    }

    @action
    private updateScreenSize = () => {
        const size = Math.floor(this.gameRef.current?.getBoundingClientRect().width || 0);
        this.screenSize = size
        this.player = {x: size / 2, y: size / 2}
        this.offCanvas.width = size;
        this.offCanvas.height = size;
    };

    private rand = (range: number = 10, offset: number = 0) => Math.floor(Math.random() * range) + offset;

    private handleKeyUp = (e: KeyboardEvent) => {
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

    private handleKeyDown = (e: KeyboardEvent) => {
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
                this.isGameOver && this.handleRestart();
                break;
        }
    }


    private controlPlayerMove = () => {
        const {keyPress} = this;
        const {size, speed} = this.option.player;

        if (keyPress & MultiKeyCode.up) {
            this.player.y < size ? this.player.y = size / 2 : this.player.y -= speed;
        }
        if (keyPress & MultiKeyCode.down) {
            this.player.y > this.screenSize - size ? this.player.y = this.screenSize - size / 2 : this.player.y += speed;
        }
        if (keyPress & MultiKeyCode.left) {
            this.player.x < size ? this.player.x = size / 2 : this.player.x -= speed;
        }
        if (keyPress & MultiKeyCode.right) {
            this.player.x > this.screenSize - size ? this.player.x = this.screenSize - size / 2 : this.player.x += speed;
        }
    }


    private createDot = () => {
        const {screenSize} = this;
        const {size} = this.option.dot;

        let x = 0, y = 0, speedX = 0, speedY = 0;

        switch (this.rand(DotDirection.SIZE)) {
            case DotDirection.LEFT:
                y = this.rand(screenSize - size);
                speedX = Math.abs(this.dotSpeed);
                speedY = this.dotSpeed;
                break;
            case DotDirection.TOP:
                x = this.rand(screenSize - size);
                speedX = this.dotSpeed;
                speedY = Math.abs(this.dotSpeed);
                break;
            case DotDirection.RIGHT:
                x = screenSize;
                y = this.rand(screenSize - size);
                speedX = Math.abs(this.dotSpeed) * -1;
                speedY = this.dotSpeed;
                break;
            case DotDirection.BOTTOM:
                x = this.rand(screenSize - size);
                y = screenSize;
                speedX = this.dotSpeed;
                speedY = Math.abs(this.dotSpeed) * -1;
                break;
        }

        if (this.rand(20) === 0) {
            this.dotList = [...this.dotList,
                {
                    x, y, speedX, speedY
                }];
        }
    };

    private renderDot = (offCtx: CanvasRenderingContext2D) => {
        offCtx.fillStyle = 'red';

        this.dotList.forEach(dot => {
            offCtx.beginPath();
            offCtx.arc(dot.x, dot.y, this.option.dot.size, 0, Math.PI * 2);
            offCtx.stroke();
            offCtx.fill();
        });
    };

    private updateDot = () => {
        const {screenSize} = this;
        const {size} = this.option.dot;

        this.dotList = this.dotList
            .filter(dot => dot.x > -size &&
                dot.x < screenSize + size &&
                dot.y > -size &&
                dot.y < screenSize + size)
            .map((dot: Dot) => {
                const {speedX, speedY} = dot;
                dot.x += speedX;
                dot.y += speedY;
                return dot;
            }, []);
    };

    private isCrash = () => {
        const {x: playerX, y: playerY} = this.player;
        const {player, dot} = this.option;

        for (let i = 0; i < this.dotList.length; i++) {
            const d = this.dotList[i];
            const x = d.x - playerX;
            const y = d.y - playerY;
            const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            if (distance <= player.size / 2 + dot.size / 2) {
                return true;
            }
        }

        return false;
    }

    private drawOver = (ctx: CanvasRenderingContext2D) => {
        const {screenSize} = this;

        ctx.shadowColor = 'transparent'
        ctx.font = "30px Arial";
        ctx.fillStyle = '#080808';

        ctx.fillText("GAME OVER", screenSize / 2 - 80, screenSize / 2);
        ctx.fillText("PRESS ENTER", screenSize / 2 - 90, screenSize / 2 + 30);
    };


    private handleDot = (offCtx: CanvasRenderingContext2D) => {
        this.createDot();
        this.updateDot();
        this.renderDot(offCtx);
    };


    private renderShip = (offCtx: CanvasRenderingContext2D) => {
        const {size} = this.option.player;

        offCtx.save();
        offCtx.translate(this.player.x, this.player.y)
        offCtx.rotate(this.playerAngle * (Math.PI / 180));
        if (this.playerImageResource) {
            offCtx.drawImage(this.playerImageResource, -size / 2, -size / 2, size, size);
        } else {
            offCtx.fillRect(-size / 2, -size / 2, size, size);
        }
        offCtx.restore();
    };

    @action
    private handleRestart = () => {
        const {screenSize} = this;
        this.dotList = [];
        this.player = {x: screenSize / 2, y: screenSize / 2}
        this.onDraw();
    };

    private onDraw = () => {
        if (!this.canvasRef.current) {
            return;
        }

        const offCtx = this.offCanvas.getContext("2d");

        if (!offCtx) {
            return;
        }

        offCtx.clearRect(0, 0, this.screenSize, this.screenSize);

        this.controlPlayerMove();
        this.renderShip(offCtx);
        this.handleDot(offCtx);

        this.isGameOver = this.isCrash();

        if (this.isGameOver) {
            this.drawOver(offCtx);
        }

        const ctx = this.canvasRef.current.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.screenSize, this.screenSize);
            ctx.drawImage(offCtx.canvas, 0, 0);
        }

        if (!this.isGameOver) {
            this.timer = requestAnimationFrame(this.onDraw);
        } else {
            cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }
    }

    render() {
        const {screenSize} = this;
        return (
            <article className={'game'} ref={this.gameRef}>
                <canvas ref={this.canvasRef} width={screenSize} height={screenSize} style={{background: "beige"}}>
                    캔버스를 지원하지 않는 브라우저 입니다.
                </canvas>
            </article>
        );
    }
}