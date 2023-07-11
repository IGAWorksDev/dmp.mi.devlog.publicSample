import React, {Component} from 'react';
import './Calendar.scss';
import {action, makeObservable, observable} from "mobx";
import {observer} from "mobx-react";
import {ModeDatePicker} from "./DatePicker";

const CALENDAR_DAYS_KOR = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarProps {
    onChange: (date: Date) => void;
    picker?: ModeDatePicker;
    range?: boolean;
    focus?: boolean;
    date?: Date;
    initDate?: Date;
    currentDate?: Date;
}

@observer
export default class Calendar extends Component<CalendarProps> {
    @observable
    private currentMonth: Date;
    @observable
    private selectedDate: Date;
    @observable
    private modeCalendar: ModeDatePicker = ModeDatePicker.date;

    constructor(props: any) {
        super(props);
        makeObservable(this);

        const {picker, date, initDate} = props;

        const initTarget = this.normalizationDate(date || initDate);
        this.currentMonth = initTarget;
        this.selectedDate = initTarget;
    };

    componentDidMount() {
        this.init();
    }

    private normalizationDate = (initDate?: Date) => {
        let initTarget = initDate || new Date();

        initTarget.setHours(0, 0, 0, 0);
        return initTarget;
    };

    private getLastDate(date: Date) {
        const temp = new Date(date.getTime());
        temp.setMonth(date.getMonth() + 1);
        temp.setDate(0);
        return temp.getDate();
    };

    private getPrevLastDate = (date: Date) => {
        const temp = new Date(date.getTime());
        temp.setDate(0);
        return temp.getDate();
    };



    private get modeDateMonths() {
        const date = new Date(this.currentMonth);
        let weekList = [];
        date.setDate(1);

        const prevMonthLastDate = this.getPrevLastDate(date);
        const lastDate = this.getLastDate(date);
        const day = date.getDay(); // 0~6 일-토
        const maxWeeks = Math.ceil((lastDate + day) / 7);

        for (let w = 0; w < maxWeeks; w++) {
            const week = Array(7).fill(0);
            for (let i = 0; i < 7; i++) {
                if (w == 0) {
                    const date = (i < day ? prevMonthLastDate - (day - i) : i - day) + 1;
                    week[i] = {flag: i < day ? "prev" : "curr", date};
                } else {
                    const d = i + (w * 7) - day + 1;
                    const date = d > lastDate ? d - lastDate : d ?? 0;
                    week[i] = {flag: d > lastDate ? "next" : "curr", date}
                }
            }
            weekList.push(week);
        }
        return weekList;
    };

    private normalizationTime = (time: number) => {
        return Math.floor(time / 1000 / 60 / 60 / 24);
    };

    @action
    private init = () => {
        const {picker} = this.props;
        this.modeCalendar = picker ?? ModeDatePicker.date;
    }



    private handleClickModeDate = (date: number, week: number) => action(() => {
        const {onChange} = this.props;

        const clickDate = new Date();
        const maxWeek = this.modeDateMonths.length - 1;
        let month = this.currentMonth.getMonth();
        if (week === 0 && date > 7) {
            month -= 1;
        } else if ((week === maxWeek || week === maxWeek - 1) && date < 12) {
            month += 1;
        }
        clickDate.setFullYear(this.currentMonth.getFullYear(), month, date);
        clickDate.setHours(0, 0, 0, 0);

        this.selectedDate = clickDate;
        this.currentMonth = this.selectedDate;

        onChange && onChange(this.selectedDate);

    });

    private isSelectedDate = (day:any) => {
        const currentDate = new Date();
        currentDate.setFullYear(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
        currentDate.setHours(0, 0, 0, 0);

        const currentTime = this.normalizationTime(currentDate.getTime());
        const selectedTime = this.normalizationTime(this.selectedDate.getTime());


        return currentTime===selectedTime?'select':""
    }

    private renderDatePickerCalendar = () => {
        return <div className={'body'}>
            <table className={'picker-content'}>
                <thead>
                <tr>
                    {
                        CALENDAR_DAYS_KOR.map((day, d) => {
                            return <th key={`day-${d}`}>{day}</th>
                        })
                    }
                </tr>
                </thead>
                <tbody>
                {this.modeDateMonths.map((week, w) => {

                    return <tr key={`week-${w}`} className={'date'}>
                        {
                            week.map((dateInfo, d) => {
                                const {date, flag} = dateInfo;
                                const selectedCls = this.isSelectedDate(date);
                                const stateCls = ` ${flag === "curr" ? "date-in-view" : ""} `;
                                return <td key={`date-${d}`}
                                           className={`${stateCls} ${selectedCls}`} onMouseDown={this.handleClickModeDate(date, w)}>
                                    {date}
                                </td>
                            })
                        }
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    }
    render() {
        const {focus} = this.props;
        return (
            <div id={`sample-calendar`} className={`${focus ? "focus" : ""}`}>
                <div className={`date container`}>
                    {this.renderDatePickerCalendar()}
                </div>

            </div>)
    }
}
