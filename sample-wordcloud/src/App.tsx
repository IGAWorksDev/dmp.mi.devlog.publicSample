import React from "react";
import './App.scss';
import WordCloud from "./sample/WordCloud";
import {observer} from "mobx-react";
import {computed, makeObservable} from "mobx";
//@ts-ignore
import BackgroundCIRCLE from "../src/sample/word_circle.svg";
//@ts-ignore
import BackgroundBlueCIRCLE from "../src/sample/word_circle_blue.png";
import WordCloudV2 from "./sample/WordCloudV2";

const hangulData = [
    {
        "count": 38,
        "keyword": "보험"
    },
    {
        "count": 31,
        "keyword": "계산"
    },
    {
        "count": 31,
        "keyword": "보험료"
    },
    {
        "count": 30,
        "keyword": "가입"
    },
    {
        "count": 29,
        "keyword": "보장"
    },
    {
        "count": 28,
        "keyword": "간편"
    },
    {
        "count": 22,
        "keyword": "확인"
    },
    {
        "count": 17,
        "keyword": "3"
    },
    {
        "count": 15,
        "keyword": "원"
    },
    {
        "count": 15,
        "keyword": "지급"
    },
    {
        "count": 14,
        "keyword": "시"
    },
    {
        "count": 14,
        "keyword": "이벤트"
    },
    {
        "count": 14,
        "keyword": "특약"
    },
    {
        "count": 12,
        "keyword": "100"
    },
    {
        "count": 12,
        "keyword": "만"
    },
    {
        "count": 12,
        "keyword": "비"
    },
    {
        "count": 12,
        "keyword": "상담"
    },
    {
        "count": 12,
        "keyword": "시간"
    },
    {
        "count": 12,
        "keyword": "암"
    },
    {
        "count": 12,
        "keyword": "참여"
    },
    {
        "count": 11,
        "keyword": "24"
    },
    {
        "count": 11,
        "keyword": "24시간"
    },
    {
        "count": 11,
        "keyword": "상담신청"
    },
    {
        "count": 11,
        "keyword": "신청"
    },
    {
        "count": 11,
        "keyword": "혜택"
    },
    {
        "count": 10,
        "keyword": "대"
    },
    {
        "count": 10,
        "keyword": "대비"
    },
    {
        "count": 9,
        "keyword": "중"
    },
    {
        "count": 8,
        "keyword": "건강"
    },
    {
        "count": 8,
        "keyword": "건강보험"
    }
]
@observer
export default class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        makeObservable(this);
    }


    @computed
    private get keywordChartData() {
        const keywords = hangulData;
        const min = Math.min(...keywords.flatMap(k => k.count));
        const max = Math.max(...keywords.flatMap(k => k.count));
        const length = Math.max(max - min, 1);
        const wordCloudMax = 10;

        return keywords.map(k => ({
            word: k.keyword,
            value: Math.floor((k.count - min) * (wordCloudMax / length) + 4)
        }));
    }

    render() {
        return (

            <div className="App">
                <header className="App-header">
                    <p>
                        <WordCloud words={this.keywordChartData} width={50} height={50} size={5}
                                   shape={BackgroundBlueCIRCLE}/>
                    </p>

                    <p>
                        <WordCloudV2 words={this.keywordChartData}
                                     width={250}
                                     height={250}
                                     opt={{
                                         debugMode: true,
                                         maskingImage: BackgroundBlueCIRCLE
                                     }}/>
                    </p>
                </header>
            </div>
        );
    }

}

