import React from 'react';
import {observer} from "mobx-react";
import {action, makeObservable, observable, toJS} from "mobx";
import * as topojson from 'topojson';
import * as d3 from 'd3';

@observer
export default class GeoMap extends React.Component<any, any> {

    @observable
    private svgPathList: string[] = [];

    constructor(props: any) {
        super(props);
        makeObservable(this);

    }

    componentDidMount() {
        this.init();
    }

    @action
    private init = () => {
        import('./resource/korea.json').then(action((mapData: any) => {
            const geoJson: any = topojson.feature(mapData, mapData.objects.korea); //topoJSON -> geoJSON 변환 로직
            const projection = d3.geoMercator()
                .center([126.980886, 37.524502]) //지도 중심 위경도 (서울 용산구)
                .scale(5500); //지도 확대 배율
            const pathProjection = d3.geoPath().projection(projection); //svg path 컨버팅용
            this.svgPathList = geoJson.features.map((data: any) => pathProjection(data));
        }));
    }


    render() {
        return (
            <svg width={800} height={800}>
                {
                    this.svgPathList.map((d, i) =>
                        <path key={i}
                              d={d}
                              fill={"blue"}
                              stroke={"red"}
                              strokeWidth={1}/>)
                }
            </svg>
        );
    }
};