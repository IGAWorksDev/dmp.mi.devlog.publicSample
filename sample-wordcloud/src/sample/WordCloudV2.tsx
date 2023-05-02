import React, {Component} from 'react';
import {observer} from "mobx-react";
import {action, computed, makeObservable, observable} from "mobx";

interface WordCloudProps {
    words: WordType[];
    width?: number; //컴포넌트의 너비
    height?: number; //컴포넌트의 높이
    opt?: Options;
}

export interface Options {
    maskingImage?: any; //마스킹 용 이미지
    sorted?: boolean; //데이터 내림차순 정렬
    debugMode?: boolean; //디버그모드
    minFontSize?: number; //폰트의 최소값
    maxFontSize?: number; //폰트의 최대값
}

export interface WordType {
    word: string,
    value: number
}

interface WordTypeInner extends WordType {
    width: number;
    height: number;
    fontSize: number;
}

interface ResultType {
    x: number,
    y: number,
    word: string,
    direction?: Direction,
    weight: number;
    fontSize: number;
}

enum Direction {
    portrait = "portrait",
    landscape = "landscape"
}

@observer
class WordCloud extends Component<WordCloudProps> {
    private readonly defaultSize = 250; //컴포넌트의 기본 크기 가로,세로 250
    private readonly mainRef = React.createRef<HTMLDivElement>();
    private readonly testRef = React.createRef<HTMLCanvasElement>();
    private readonly offCanvas = document.createElement('canvas');

    private readonly textCanvas = document.createElement('canvas');

    //measureText 를 위한 버퍼크기
    private readonly textBufferSize = {w: 1000, h: 200};

    private maskingResource: any;

    @observable
    private loading: boolean = false;

    @observable
    private width: number = this.defaultSize;

    @observable
    private height: number = this.defaultSize;

    @observable
    private resultList: ResultType[] = [];

    private worker?: Worker;

    constructor(props: WordCloudProps) {
        super(props);
        makeObservable(this);
    };

    componentDidMount() {
        this.init();
    };

    componentDidUpdate(prevProps: Readonly<WordCloudProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.props.words !== prevProps.words) {
            this.process();
        }
    }

    //마킹 컬러 - rgba 스타일
    private get markingColorRGBA() {
        return "rgba(125,255,255,1)";
    }

    //마킹 컬러 - 합계
    private get markingColorSum() {
        return 125 + 255 * 3;
    }

    private get useShape() {
        return this.maskingResource !== undefined;
    }

    //offcanvas 에서 탐색시 몇 칸씩 건너띄워서 계산할지 산출, 50x50기준으로 계산
    @computed
    private get searchLength() {
        if (window.Worker) { //워커 사용 가능시 고성능으로 처리
            return 1;
        }
        return Math.max(1, Math.floor(this.width / 50));
    }

    //word 가중치 값에 대한 최소, 최대 값 산출 - 자동 폰트 사이즈를 산출하기 위함
    @computed
    private get minMaxValue() {
        return this.props.words.reduce((rs, w) => {
            rs.min = Math.min(w.value, rs.min);
            rs.max = Math.max(w.value, rs.max);
            return rs;
        }, {min: 8, max: 0});
    }

    private init = () => {
        this.updateSize();

        this.textCanvas.width = this.textBufferSize.w;
        this.textCanvas.height = this.textBufferSize.h;

        this.offCanvas.width = this.width;
        this.offCanvas.height = this.height;

        const {maskingImage} = this.props.opt ?? {};

        //마스킹 이미지가 있다면 로드 후 실행
        if (maskingImage) {
            const i = new Image();
            i.src = maskingImage;
            i.width = this.width;
            i.height = this.height;
            i.onload = this.process;
            this.maskingResource = i;
        } else {
            this.process();
        }
    }

    @action
    private updateSize = () => {
        const {
            width = this.defaultSize,
            height = this.defaultSize
        } = this.mainRef.current?.getBoundingClientRect() ?? {};
        this.width = width;
        this.height = height;
    };


    //마스크 이미지에서 주로 사용되는 색상을 가져옴
    private getMaskForegroundColor = (imageData: ImageData) => {
        let max = 0;
        const {data} = imageData;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            max = Math.max(r + g + b + a, max);
        }

        return max;
    };

    //가중치별 텍스트 컬러
    private getTextColor = (weight: number) => {
        if (15 <= weight && weight < 21) {
            return "#FB3363"
        } else if (12 <= weight && weight < 15) {
            return "#06AD85";
        } else if (9 <= weight && weight < 12) {
            return "#3353FB";
        } else if (6 <= weight && weight < 9) {
            return "#757575";
        } else if (3 <= weight && weight < 6) {
            return "#A1A1A1";
        } else if (1 <= weight && weight < 3) {
            return "#BABABA";
        }
        return "#000000";
    };

    //단어 별로 실제 사용될 width, height, fontSize 미리 산출
    private buildWordData = (): WordTypeInner[] => {
        const {words, opt = {sorted: true}} = this.props;

        let wordData: WordType[] = [...words];

        if (!opt.sorted) {
            wordData = wordData.sort((a, b) => b.value - a.value);
        }

        return wordData.map((w, i) => {
            const fontSize = this.getFontSize(w.value);
            const {w: width, h: height} = this.measureText(w.word, fontSize);
            return {
                ...w,
                width,
                height,
                fontSize
            }
        });
    }

    //가중치별 폰트사이즈 계산
    private getFontSize = (weight: number) => {
        const {minFontSize = 14, maxFontSize = 64} = this.props.opt ?? {};
        const {min, max} = this.minMaxValue;
        const weightPerFontSize = (maxFontSize - minFontSize) / (max - min);
        return Math.floor((weight - min) * weightPerFontSize) + minFontSize;
    };

    //canvas 에 텍스트의 실제 너비, 높이를 산출하기 위한 로직
    private measureText = (text: string, fontSize: number, separator = "▉") => {
        const {textCanvas, textBufferSize} = this;

        const textCtx = textCanvas.getContext('2d', {willReadFrequently: true});

        if (textCtx) {
            textCtx.font = `${fontSize}px arial`;
            textCtx.textAlign = "left";
            textCtx.textBaseline = "top";
            textCtx.fillStyle = this.markingColorRGBA;

            textCtx.clearRect(0, 0, textBufferSize.w, textBufferSize.h);
            textCtx.fillText(separator, 0, 0);
            const {data: rgbBeforeData = []} = textCtx.getImageData(0, 0, textBufferSize.w, textBufferSize.h);

            //separator 에 대한 크기를 산출
            let separatorSize = 0;
            for (let i = 2 * Math.round(fontSize) * 4; i >= 0; i -= 4) {
                const rowIdx = textBufferSize.w * 4 * 2 + i;
                const r = rgbBeforeData[rowIdx];
                const g = rgbBeforeData[rowIdx + 1];
                const b = rgbBeforeData[rowIdx + 2];
                const a = rgbBeforeData[rowIdx + 3];
                if (r + g + b + a === this.markingColorSum) {
                    separatorSize = Math.floor(i / 4);
                    break;
                }
            }

            textCtx.clearRect(0, 0, textBufferSize.w, textBufferSize.h);
            textCtx.fillText(separator + text + separator, 0, 0);

            const {data: rgbData = []} = textCtx.getImageData(0, 0, textBufferSize.w, textBufferSize.h);

            //너비를 산출
            let ex = 0;
            for (let i = Math.min(textBufferSize.w * 4, (text.length + 2) * Math.round(fontSize) * 4); i >= 0; i -= 4) {
                const rowIdx = textBufferSize.w * 4 * 2 + i;
                const r = rgbData[rowIdx];
                const g = rgbData[rowIdx + 1];
                const b = rgbData[rowIdx + 2];
                const a = rgbData[rowIdx + 3];
                if (r + g + b + a === this.markingColorSum) {
                    ex = Math.floor(i / 4);
                    break;
                }
            }

            //높이를 산출
            let ey = 0;
            for (let i = textBufferSize.h - 1; i >= 0; i--) {
                const rowIdx = textBufferSize.w * i * 4;
                const r = rgbData[rowIdx];
                const g = rgbData[rowIdx + 1];
                const b = rgbData[rowIdx + 2];
                const a = rgbData[rowIdx + 3];
                if (r + g + b + a === this.markingColorSum) {
                    ey = Math.floor(i);
                    break;
                }
            }
            return {w: ex - separatorSize * 2, h: ey};
        }

        return {w: 0, h: 0};
    };

    @action
    private process = () => {
        const ctx = this.offCanvas.getContext("2d", {willReadFrequently: true});
        if (!ctx) {
            console.error("Canvas 객체를 찾을수 없습니다.");
            return;
        } else if (!window.Worker) {
            console.error("Web Worker 를 지원하지 않습니다.")
            return;
        }

        const {width, height} = this;

        //ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillStyle = this.markingColorRGBA;

        if (this.useShape) {
            ctx.drawImage(this.maskingResource, 0, 0, width, height);
        }

        const fgColor = this.getMaskForegroundColor(ctx.getImageData(0, 0, width, height));
        const wordData = this.buildWordData();
        const startX = width / 2;
        const startY = height / 2;


        if (this.worker) {
            this.worker.terminate();
        }


        this.loading = true;
        this.resultList = [];

        this.worker = new Worker("/worker.js");

        this.worker.postMessage({type: "start"});

        this.worker.onmessage = action((event) => {
            const {type} = event.data;

            if (type === 'next' && wordData.length === 0) {
                this.worker.terminate();
                this.worker = undefined;
                this.loading = false;

                if (this.props.opt?.debugMode) {
                    const realCtx = this.testRef.current?.getContext('2d', {willReadFrequently: true});
                    if (!realCtx) {
                        return;
                    }

                    realCtx.drawImage(ctx.canvas, 0, 0);
                }
                return;
            }

            if (type === 'next') {
                const imageData = ctx.getImageData(0, 0, width, height);
                const direction = Math.floor(Math.random() * 2) === 0 ? Direction.portrait : Direction.landscape;
                const word = wordData.shift();

                this.worker.postMessage({
                    type: "process",
                    imageData,
                    direction,
                    word,
                    searchLength: this.searchLength,
                    fgColor,
                    startX,
                    startY,
                    markingColor: this.markingColorSum
                });
            } else if (type === 'result') {
                const {word, direction, x, y} = event.data ?? {};
                if (!word) {
                    console.error("연산 결과가 없습니다.")
                    return;
                }

                this.drawMarking(ctx, x, y, word.width, word.height, direction);

                this.resultList = [...this.resultList, {
                    x,
                    y,
                    word: word.word,
                    direction,
                    weight: word.value,
                    fontSize: word.fontSize
                }];
            }
        });

        /*wordData.map((w) => {
            //캔버스 갱신
            const imageData = ctx.getImageData(0, 0, width, height);


            //Todo : 요부분은 워커로 옮길 예정
            //첫번째 선정된 방향 으로 놓아보면서 위치를 산출
            let find = this.findXy(imageData,
                direction,
                w,
                this.searchLength,
                fgColor,
                startX,
                startY);

            //이전 방향 탐색시 높을 자리가 없다면 다른 방향으로 재탐색
            if (!find) {
                direction === Direction.portrait ? Direction.landscape : Direction.portrait;

                find = this.findXy(imageData,
                    direction,
                    w,
                    this.searchLength,
                    fgColor,
                    startX,
                    startY);
            }

            //찾은 결과가 있다면 캔버스에 그림
            if (find) {
                this.drawMarking(ctx, find.x, find.y, w.width, w.height, direction);
                resultList.push({
                    x: find.x,
                    y: find.y,
                    word: w.word,
                    direction,
                    weight: w.value,
                    fontSize: w.fontSize
                });
            }
        });

        this.resultList = resultList;

        ctx.restore();

        */
    }


    private drawMarking = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, direction: Direction) => {
        if (direction === Direction.portrait) {
            ctx.fillRect(x - h / 2, y - w / 2, h, w);
        } else {
            ctx.fillRect(x - w / 2, y - h / 2, w, h);
        }
    };

    render() {
        const {width = 200, height = 200, opt = {debugMode: false}} = this.props;
        return (
            <div className={'word-cloud'}
                 ref={this.mainRef}
                 style={{display: "inline-block", width, height}}>
                <div style={{position: "relative", width: this.width, height: this.height}}>
                    {
                        this.resultList.map((w, i) =>
                            <span key={i}
                                  style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      position: "absolute",
                                      left: w.x,
                                      top: w.y,
                                      fontSize: w.fontSize,
                                      whiteSpace: "nowrap",
                                      color: this.getTextColor(w.weight),
                                      transform: `translate(-50%, -50%) ${w.direction === Direction.portrait ? "rotate(90deg)" : ""}`
                                  }}>
                            {w.word}
                        </span>)
                    }
                    {
                        this.loading && <p style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)"
                        }}>작업중...</p>
                    }
                </div>
                {opt.debugMode && <canvas width={this.width} height={this.height} ref={this.testRef}/>}
            </div>
        );
    };
}

export default WordCloud;
