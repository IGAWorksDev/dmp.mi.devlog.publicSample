import React, {Component, createRef} from 'react';
import {observer} from "mobx-react";
import {action, computed, observable, toJS} from "mobx";
import {inherits} from "util";

interface WordCloudProps {
    size?: number;
    width?: number;
    height?: number;
    words: WordType[];
    shape?: any;
    random?: boolean;
}

export interface WordType {
    word: string,
    value: number
}

interface ResultType {
    x: number,
    y: number,
    word: string,
    direction?: string,
    size: number;
}


@observer
export default class MKTWordCloud extends Component<WordCloudProps> {
    private backgroundShape: any;
    private getMode: { [key: string]: number } = {};
    private modeColor: number = 255;

    @observable
    private resultList: ResultType[] = [];

    // 사방탐색 방향
    private readonly canvasRef = createRef<HTMLCanvasElement>();
    private readonly canvasRefWatch = createRef<HTMLCanvasElement>();
    private readonly canvasRefCompare = createRef<HTMLCanvasElement>();
    private readonly visitedBuffer = Array.from(Array(this.originalCanvasWidth), () => new Array(this.originalCanvasHeight).fill(0));
    @observable
    private pos = {drawable: false, x: -1, y: -1};

    constructor(props: WordCloudProps) {
        super(props);
    };

    componentDidMount() {
        if (this.props.shape) {
            this.backgroundShape = this.createImage(this.props.shape);
        } else {
            this.onFinished();
        }
    };

    componentDidUpdate(prevProps: Readonly<WordCloudProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.props.words !== prevProps.words) {
            this.onFinished();
        }
    }

    @computed
    private get originalCanvasWidth() {
        return this.props.width || 50;
    };

    @computed
    private get originalCanvasHeight() {
        return this.props.height || 50;
    };

    @computed
    private get scale() {
        return this.props.size || 2;
    };

    @computed
    private get startPosX() {
        return Math.floor(this.originalCanvasWidth / 2);
    };

    @computed
    private get startPosY() {
        return Math.floor(this.originalCanvasHeight / 2);
    };

    private createImage = (resource: any) => {
        const i = new Image();
        i.src = resource;
        i.width = this.originalCanvasWidth;
        i.height = this.originalCanvasHeight;
        i.onload = this.onFinished;
        return i;
    };

    onFinished = () => {
        let canvas = this.canvasRef.current;
        let ctx = canvas?.getContext("2d");
        let canvasWatch = this.canvasRefWatch.current;
        let ctxW = canvasWatch?.getContext("2d");
        if (!this.canvasRef.current || !this.canvasRefWatch.current || !this.canvasRefWatch.current) {
            return;
        }
        if (!ctx || !ctxW) {
            return;
        }

        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctxW.textBaseline = "top";
        ctxW.textAlign = "left";
        this.createWord(ctx, canvas, ctxW);
    };

    @action
    private createWord = (ctx: CanvasRenderingContext2D, canvas: any, ctxW: CanvasRenderingContext2D) => {
        const {words, shape, random} = this.props;
        let wordData: WordType[] = words.slice();
        if (!random) {
            wordData = wordData.sort((a, b) => b.value - a.value);
        }
        if (shape) {
            ctx.drawImage(this.backgroundShape, 0, 0);
        }
        let canvasBitmap = this.checkBitmap(canvas, ctx);

        const resultList: ResultType[] = [];
        wordData.map((w, idx) => {
            const minimumFontSize = 10 / this.scale;
            const textHeight = Math.max(w.value, (minimumFontSize));
            ctx.font = `${textHeight}px sans-serif`;
            const textWidth = ctx.measureText(w.word).width * 0.85;
            ctxW.font = `${Math.max(w.value * this.scale, (minimumFontSize * this.scale))}px sans-serif`;
            let visitedCheckerBFS = this.visitedBuffer.map(v => v.slice());
            const beforeCanvasMap = this.checkBitmap(canvas, ctx);

            const textHeightArea = textHeight + 0.5;
            const textWidthArea = textWidth + 0.5;


            if (idx % 2 === 0) {
                const canvasWidth = this.originalCanvasHeight - textHeightArea;
                const canvasHeight = this.originalCanvasWidth - textWidthArea;
                const {
                    x,
                    y,
                    isFind
                } = this.calculateXY(canvasBitmap, w, canvasHeight, canvasWidth, visitedCheckerBFS, textWidthArea, textHeightArea);
                if (isFind) {
                    console.log(w);
                    const direction = w.value>10?"garo":"sero";
                    canvasBitmap = this.drawWord(canvas, ctx, ctxW, w, x, y, direction);
                    resultList.push({
                        x,
                        y,
                        word: w.word,
                        direction: direction,
                        size: w.value
                    });
                }
            } else {
                const canvasWidth = this.originalCanvasWidth - textWidthArea;
                const canvasHeight = this.originalCanvasHeight - textHeightArea;
                const {
                    x,
                    y,
                    isFind
                } = this.calculateXY(canvasBitmap, w, canvasHeight, canvasWidth, visitedCheckerBFS, textHeightArea, textWidthArea);
                if (isFind) {
                    canvasBitmap = this.drawWord(canvas, ctx, ctxW, w, x, y, 'garo');
                    resultList.push({
                        x,
                        y,
                        word: w.word,
                        direction: "garo",
                        size: w.value
                    });
                }
            }
            // 새로 추가된 단어가 없는 경우 빈 공간 찾아서 단어 넣기
            if (JSON.stringify(beforeCanvasMap) === JSON.stringify(canvasBitmap)) {
                const {
                    Bitmap,
                    x,
                    y,
                    direction,
                    isFind
                } = this.putWordGap(canvas, ctx, ctxW, w, canvasBitmap, idx, textHeightArea, textWidthArea, resultList);
                canvasBitmap = Bitmap;
                if (isFind) {
                    resultList.push({
                        x,
                        y,
                        word: w.word,
                        direction,
                        size: w.value,
                    })
                }

            }

        })
        this.resultList = resultList;
    };

    // 비트맵 이차원 배열 return
    private checkBitmap = (canvas: any, ctx: CanvasRenderingContext2D) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasBitmap = Array.from(Array(canvasWidth), () => new Array(canvasHeight));
        for (let row = 0; row < this.originalCanvasHeight; row++) {
            for (let col = 0; col < this.originalCanvasWidth; col++) {
                const bitmapArr = Array.from(imageData.data.subarray(
                    (row * imageData.width + col) * 4,
                    (row * imageData.width + col) * 4 + 4
                ));
                const bitmapSum = bitmapArr.reduce((acc, curr) => acc + curr);
                this.getMode.hasOwnProperty(String(bitmapSum)) && bitmapSum !== 0 ? (this.getMode[String(bitmapSum)] += 1) : (this.getMode[String(bitmapSum)] = 1);
                canvasBitmap[row][col] = bitmapSum;
            }
        }
        const modeBitmapColor = Object.keys(this.getMode).sort((a, b) => this.getMode[b] - this.getMode[a])[0];
        this.modeColor = parseInt(modeBitmapColor);
        return canvasBitmap
    };

    // 주어진 기본 랜덤에도 못찾으면 전체 탐색
    private drawWord = (canvas: any, ctx: CanvasRenderingContext2D, ctxW: CanvasRenderingContext2D, w: WordType, x: number, y: number, direction: string) => {
        if (direction === "sero") {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 2);
            ctx.textBaseline = "bottom";
            ctx.fillText(w.word, 0, 0);
            ctx.restore();


            ctxW.save();
            ctxW.translate(x * this.scale, y * this.scale);
            ctxW.rotate(Math.PI / 2);
            ctxW.textBaseline = "bottom";
            ctxW.fillText(w.word, 0, 0);
            ctxW.restore();


            return this.checkBitmap(canvas, ctx)
        } else {
            ctx.textBaseline = "top";
            ctx.fillText(w.word, x, y);
            ctxW.textBaseline = "top";
            ctxW.fillText(w.word, (x) * this.scale, (y) * this.scale);
            ctx.restore();
            ctxW.restore();

            return this.checkBitmap(canvas, ctx);
        }
    };

    // 재귀를 통한 탐색
    private checkPositionDFS = (canvasMap: any, startX: number, startY: number, currentX: number, currentY: number, height: number, width: number, visitedChecker: number[][]) => {
        if (currentY < startY ||
            currentY >= startY + height ||
            currentX < startX ||
            currentX >= startX + width) {
            return true;
        }
        // 글자 존재 할 때 return
        if (this.props.shape) {
            if (canvasMap[currentY][currentX] < this.modeColor) {
                return false;
            }
        } else if (canvasMap[currentY][currentX] > 0) {
            return false
        }


        // 글자가 없고 방문하지 않았다면
        if (visitedChecker[currentY][currentX] === 0) {
            // 방문표시
            visitedChecker[currentY][currentX] = 1;

            // 다음 좌표를 재귀
            // Todo : 탐색 길이? 1에 대한 옵션만들기
            if (!this.checkPositionDFS(canvasMap, startX, startY, currentX + 1, currentY, height, width, visitedChecker) ||
                !this.checkPositionDFS(canvasMap, startX, startY, currentX, currentY + 1, height, width, visitedChecker)) {
                return false;
            }
        }
        return true;
    };

    private calculateXY = (canvasMap: any, w: WordType, canvasHeight: number, canvasWidth: number, visited: number[][], size1: number, size2: number) => {

        const moveXY = [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: -1, y: 1}, {
            x: -1,
            y: 0
        }, {x: -1, y: -1}];
        let x = this.startPosX;
        let y = this.startPosY;
        const q = [];
        q.push({xPos: x, yPos: y});
        visited[y][x] = 1;
        let isFind = false;
        const checkCanvasMap = this.props.shape ? this.modeColor : 0;

        qWhile : while (q.length) {
            const {xPos = this.startPosX, yPos = this.startPosY} = q.shift() || {};
            for (let i = 0; i < 8; i++) {
                const nextY: number = yPos + moveXY[i].y * 2;
                const nextX: number = xPos + moveXY[i].x * 2;
                if (nextY >= 0 && nextY < canvasHeight && nextX >= 0 && nextX < canvasWidth) {
                    if (visited[nextY][nextX] === 0 && canvasMap[nextY][nextX] === checkCanvasMap) {
                        visited[nextY][nextX] = 1;
                        q.push({xPos: nextX, yPos: nextY});
                        const visitedChecker = this.visitedBuffer.map(v => v.slice());
                        if (this.checkPositionDFS(canvasMap, nextX, nextY, nextX, nextY, size1, size2, visitedChecker)) {
                            isFind = true;
                            x = nextX;
                            y = nextY
                            break qWhile;
                        }

                    }
                }
            }
        }
        return {x, y, isFind};
    };

    private putWordGap = (canvas: any, ctx: CanvasRenderingContext2D, ctxW: CanvasRenderingContext2D, w: WordType, Bitmap: number[][], idx: number, textHeight: number, textWidth: number, results: ResultType[]) => {
        let direction;
        let x = 0;
        let y = 0;
        let isFind: boolean = false;

        if (idx % 2 !== 0) {
            const canvasWidth = this.originalCanvasHeight - textHeight;
            const canvasHeight = this.originalCanvasWidth - textWidth;
            rowFor:for (let row = 0; row < canvasHeight; row++) {
                colFor:for (let col = 0; col < canvasWidth; col++) {
                    const visitedChecker = this.visitedBuffer.map(v => v.slice());
                    const r = this.checkPositionDFS(Bitmap, col, row, col, row, textWidth, textHeight, visitedChecker);
                    if (r) {
                        Bitmap = this.drawWord(canvas, ctx, ctxW, w, col, row, "sero");
                        direction = "sero";
                        x = col;
                        y = row;
                        isFind = true;
                        break rowFor;
                    }
                }
            }
        } else {
            const canvasWidth = this.originalCanvasWidth - textWidth;
            const canvasHeight = this.originalCanvasHeight - textHeight;
            rowFor:for (let row = 0; row < canvasHeight; row++) {
                colFor:for (let col = 0; col < canvasWidth; col++) {
                    const visitedChecker = this.visitedBuffer.map(v => v.slice());
                    const r = this.checkPositionDFS(Bitmap, col, row, col, row, textHeight, textWidth, visitedChecker);
                    if (r) {
                        Bitmap = this.drawWord(canvas, ctx, ctxW, w, col, row, "garo");
                        direction = "garo";
                        x = col;
                        y = row;
                        isFind = true;
                        break rowFor;
                    }
                }
            }
        }
        return {Bitmap, x, y, direction, isFind};
    };

    private textColor = (size: number) => {
        // 최소 3, 최대 20
        if (15 <= size && size < 21) {
            return "#FB3363"
        } else if (12 <= size && size < 15) {
            return "#06AD85";
        } else if (9 <= size && size < 12) {
            return "#3353FB";
        } else if (6 <= size && size < 9) {
            return "#757575";
        } else if (3 <= size && size < 6) {
            return "#A1A1A1";
        } else if (1 <= size && size < 3) {
            return "#BABABA";
        }
    };


    render() {
        const {originalCanvasWidth, originalCanvasHeight} = this;
        return (
            <div className={'word-cloud'} style={{display: "inline-block"}}>
                <canvas ref={this.canvasRefWatch} width={originalCanvasWidth * this.scale}
                        height={this.originalCanvasHeight * this.scale}
                        style={{
                            backgroundColor: "white",display:"none",
                            fontFamily: "sans-serif"
                        }}/>
                <canvas ref={this.canvasRef} width={originalCanvasWidth} height={originalCanvasHeight}
                        style={{
                            backgroundColor: "white",
                            fontFamily: "sans-serif"
                        }}/>
                <svg width={originalCanvasWidth * this.scale} height={originalCanvasHeight * this.scale}>
                    <g>
                        {this.resultList.map((d, i) => {
                            const x = d.x * this.scale;
                            const y = d.y * this.scale;
                            const fontsize = Math.max(d.size * this.scale, 10);

                            return <text key={i}
                                         style={{
                                             fontSize: fontsize,
                                             fontFamily: "sans-serif",
                                             fill: this.textColor(d.size),
                                             whiteSpace: "nowrap",
                                             display: "block",
                                             transformOrigin: "0px 0px",
                                         }}
                                         dominantBaseline={"hanging"}
                                         alignmentBaseline={`${d.direction === 'sero' ? "text-after-edge" : "baseline"}`}
                                         transform={`translate(${x},${y}) ${d.direction === 'sero' ? `rotate(90,${0},${0})` : ""}`}
                            >{d.word}</text>
                        })}
                    </g>
                </svg>
            </div>
        );
    };
}

