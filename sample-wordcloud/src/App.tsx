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
        word: "React",
        value: 100
    },
    {
        word: "Next.js",
        value: 70
    },
    {
        word: "ECMA6",
        value: 70
    },
    {
        word: "Mobx",
        value: 55
    },
    {
        word: "Parcel",
        value: 60
    },
    {
        word: "Webpack",
        value: 40
    },
    {
        word: "GoLang",
        value: 40
    },
    {
        word: "AWS",
        value: 70
    },
    {
        word: "SCSS",
        value: 80
    },
    {
        word: "Node.js",
        value: 75
    },
    {
        word: "Nginx",
        value: 45
    },
    {
        word: "Mongo DB",
        value: 65
    },
    {
        word: "Redis",
        value: 45
    },
    {
        word: "Code Build",
        value: 22
    },
    {
        word: "Code Deploy",
        value: 22
    },
    {
        word: "Code Pipeline",
        value: 22
    },
    {
        word: "EC2",
        value: 22
    },
    {
        word: "ELB",
        value: 22
    },
    {
        word: "ECS",
        value: 22
    },
    {
        word: "Docker",
        value: 40
    },
    {
        word: "Compose",
        value: 40
    },
    {
        word: "Github",
        value: 67
    },
    {
        word: "Markdown",
        value: 20
    },
    {
        word: "CSS",
        value: 45
    },
    {
        word: "TypeScript",
        value: 50
    },
    {
        word: "Gimp",
        value: 28
    },
    {
        word: "Inkscape",
        value: 28
    },
    {
        word: "Linux",
        value: 28
    },
    {
        word: "Jest",
        value: 28
    },
    {
        word: "GraphQL",
        value: 40
    },
    {
        word: "ECR",
        value: 22
    },
    {
        word: "Slack",
        value: 22
    },
    {
        word: "figma",
        value: 22
    },
    {
        word: "Zeplin",
        value: 22
    },
    {
        word: "Javascript",
        value: 22
    }
];

const DUMMY_DATA = [
    {
        word: "리니지라이크",
        value: 100
    },
    {
        word: "리니지M",
        value: 70
    },
    {
        word: "RPG 신작",
        value: 70
    },
    {
        word: "무료 쿠폰 이벤트",
        value: 70
    },
    {
        word: "리니지/리니지라이크 유저 비율",
        value: 60
    },
    {
        word: "승급 이벤트",
        value: 40
    },
    {
        word: "무료 게임 랭킹",
        value: 40
    },
    {
        word: "영문 레터링 문구",
        value: 50
    },
    {
        word: "리필세트",
        value: 60
    },
    {
        word: "유저 관심 키워드",
        value: 75
    },
    {
        word: "마블링 스트라이프",
        value: 45
    },
    {
        word: "RPG 게임 유저 관심 키워드",
        value: 65
    },
    {
        word: "카카오톡 즐겨찾기",
        value: 45
    },
    {
        word: "리니지W",
        value: 22
    },
    {
        word: "그레이 라인",
        value: 22
    },
    {
        word: "리니지 서바이벌",
        value: 22
    },
    {
        word: "던전",
        value: 22
    },
    {
        word: "신규 게임 순위",
        value: 35
    },
    {
        word: "마블링 스트라이프",
        value: 22
    },
    {
        word: "MMORPG",
        value: 40
    },
    {
        word: "리필 세트",
        value: 40
    },
    {
        word: "승급 이벤트",
        value: 67
    },
    {
        word: "그레이 라인업 키워드",
        value: 20
    },
    {
        word: "1종 154스타일",
        value: 45
    },
    {
        word: "RPG 키워드 위치",
        value: 50
    },
    {
        word: "애슬릿 블랙",
        value: 28
    },
    {
        word: "방치형 MMORPG",
        value: 28
    },
    {
        word: "유료 게임 랭킹",
        value: 28
    },
    {
        word: "한글 및 영문 번역",
        value: 28
    },
    {
        word: "영문 레터일 문구",
        value: 40
    },
    {
        word: "링킹전",
        value: 22
    },
    {
        word: "라뗴는 말이야",
        value: 22
    },
    {
        word: "서바이벌 게임",
        value: 22
    },
    {
        word: "케릭터 균형",
        value: 22
    },
    {
        word: "연말 이벤트",
        value: 22
    }
];

export default class App extends React.Component<any, any> {
    render() {
        return (

            <div className="App">
                <WordCloudV2 words={DUMMY_DATA}
                             width={530}
                             height={530}
                             opt={{
                                 minFontSize: 16,
                                 maxFontSize: 74,
                                 debugMode: true,
                                 sorted: false,
                                 // maskingImage: BackgroundBlueCIRCLE
                             }}/>
            </div>
        );
    }

}

