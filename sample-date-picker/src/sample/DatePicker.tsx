import React, {Component} from 'react';
import './DatePicker.scss';
import Calendar from "./Calendar";
import TodayIcon from '@mui/icons-material/Today';
import {observer} from "mobx-react";
import {action, makeObservable, observable} from "mobx";
import {modeYearWeeks} from "../tools/Tools";


interface DatePickerProps {
    onChange: (date: Date | string) => void;
    picker?: ModeDatePicker;
}

export enum ModeDatePicker {
    year = "year",
    month = "month",
    date = "date",
    week = "week",
}
@observer
export default class DatePicker extends Component<DatePickerProps> {

    @observable
    private currentMonth: Date;
    @observable
    private selectedDate: Date;
    @observable
    private isFocus: boolean = false;
    @observable
    private modeCalendar: ModeDatePicker = ModeDatePicker.date;


    constructor(props: any) {
        super(props);
        makeObservable(this);

        const {picker} = this.props;


        const initTarget = this.normalizationDate();
        this.currentMonth = initTarget;
        this.selectedDate = initTarget;
        this.modeCalendar = picker ?? ModeDatePicker.date;

    }


    private normalizationDate = (initDate?: Date) => {
        let initTarget = initDate || new Date();

        initTarget.setHours(0, 0, 0, 0);
        return initTarget;
    };

    private get selectedPickerDate() {
        const {picker = ModeDatePicker.date} = this.props;

        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth() + 1;
        const date = this.selectedDate.getDate();
        if (picker === ModeDatePicker.date) {
            return `${year}/${month}/${date}`;
        } else if (picker === ModeDatePicker.week) {
            return `${year}-${modeYearWeeks(this.selectedDate, year)}nd`
        } else if (picker === ModeDatePicker.month) {
            return `${year}/${month}`;
        } else if (picker === ModeDatePicker.year) {
            return `${year}`;
        }
    }



    @action
    private focusPicker = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        this.isFocus = !this.isFocus;
    };

    @action
    private pickerOnBlur = () => {
        this.isFocus = false;
    };

    @action
    private onChangeCalender = (date: Date) => {
        const {onChange} = this.props;
        this.selectedDate = date;
        this.isFocus = false;

        onChange && onChange(date);
    }

    render() {
        return (
            <div id={`sample-date-picker`}>
                <div className={`picker-input ${this.isFocus ? "focus" : ""}`}
                     onMouseDown={this.focusPicker} onBlur={this.pickerOnBlur} tabIndex={0}>
                    <TodayIcon/>
                    <span>{this.selectedPickerDate}</span>
                </div>
                <Calendar onChange={this.onChangeCalender}
                          picker={this.modeCalendar}
                          date={this.selectedDate}
                          focus={this.isFocus}/>
            </div>
        );
    }
}

