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
]
@observer
export default class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        makeObservable(this);
    }



    render() {
        return (

            <div className="App">
                <header className="App-header">


                    <p>
                        <WordCloudV2   words={hangulData}
                                       width={530}
                                       height={530}
                                     opt={{
                                         minFontSize: 16,
                                         maxFontSize: 74,
                                         debugMode: true,
                                         sorted: false,
                                         maskingImage: BackgroundBlueCIRCLE
                                     }}/>
                    </p>
                </header>
            </div>
        );
    }

}

