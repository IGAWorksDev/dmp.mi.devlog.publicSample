import React, {Component} from 'react';
import './Calendar.scss';
import {action, computed, makeObservable, observable, reaction, runInAction} from "mobx";
import {observer} from "mobx-react";
import {ModeDatePicker} from "./DatePicker";
import {modeYearWeeks} from "../tools/Tools";
import {ArrowBack, ArrowForward} from "@mui/icons-material";
import {getHoliday} from "../api/holiday";

const CALENDAR_DAYS_KOR = ['일', '월', '화', '수', '목', '금', '토'];
const CALENDAR_MONTH_KOR = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const REQUEST_URL = 'https://public.data.igaw.io/holiday/search'


interface CalendarProps {
    onChange: (date: Date) => void;
    picker?: ModeDatePicker;
    range?: boolean;
    focus?: boolean;
    date?: Date;
    initDate?: Date;
}

@observer
export default class Calendar extends Component<CalendarProps> {
    private readonly modeMonthsAndYears = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];

    @observable
    private currentMonth: Date = new Date();
    @observable
    private currentYear : number = new Date().getFullYear();
    @observable
    private selectedDate: Date = new Date();
    @observable
    private isFocus: boolean = false;
    @observable
    private modeCalendar: ModeDatePicker = ModeDatePicker.date;
    @observable
    private hoverWeek: number = 0;
    @observable
    private holidayList: Date[] = [];

    constructor(props: any) {
        super(props);
        makeObservable(this);


        runInAction(() => {
            const {picker, date, initDate} = props;
            const initTarget = this.normalizationDate(date || initDate);
            this.currentMonth = initTarget;
            this.selectedDate = initTarget;
            this.modeCalendar = picker ?? ModeDatePicker.date;

            this.axiosHoliday(this.currentYear);
        });

        reaction(()=>this.currentYear,
            (currentYear)=>{
            this.axiosHoliday(currentYear)
        });
    };


    private normalizationDate = (initDate?: Date) => {
        let initTarget = initDate || new Date();

        initTarget.setHours(0, 0, 0, 0);
        return initTarget;
    };


    @action
    private axiosHoliday = async (year:number) => {
        await getHoliday(year).then(res => {
                runInAction(() => {
                    this.holidayList = res.reduce((acc: any[], curr: any) => {
                        const currentDate = new Date();
                        const year = Number(curr.locdate.slice(0, 4));
                        const month = Number(curr.locdate.slice(4, 6));
                        const day = Number(curr.locdate.slice(6, 8));
                        currentDate.setFullYear(year, month - 1, day);
                        currentDate.setHours(0, 0, 0, 0);
                        acc.push(currentDate)
                        return acc
                    }, [])
                })
            }
        )
    };


    @computed
    private get lastDate() {
        const date = new Date(this.currentMonth);
        date.setDate(1);
        const temp = new Date(date.getTime());
        temp.setMonth(date.getMonth() + 1);
        temp.setDate(0);
        return temp.getDate();
    };

    @computed
    private get prevLastDate() {
        const date = new Date(this.currentMonth);
        date.setDate(1);
        const temp = new Date(date.getTime());
        temp.setDate(0);
        return temp.getDate();
    };

    private get modeDateMonths() {
        const date = new Date(this.currentMonth);
        let weekList = [];
        date.setDate(1);

        const prevMonthLastDate = this.prevLastDate;
        const lastDate = this.lastDate;
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


    private getWeekClass = (flag: "curr" | "next" | "prev", year: number, date: number) => {
        const {picker} = this.props;
        if (picker === ModeDatePicker.week) {
            let weekSelect;
            const month = this.getDateMonth(flag);
            const weeks = modeYearWeeks(new Date(year, month, date), year);
            const hoverWeeks = this.hoverWeek === weeks ? "hover" : "";

            weekSelect = weeks === modeYearWeeks(this.selectedDate, year) ? "select" : ""

            return `${hoverWeeks} ${weekSelect}`
        }
    }


    private isSameDate = (date1: Date, date2: Date) => {
        return date1.getTime() === date2.getTime() ? "select" : "";
    }

    private isSelectedDate = (day: any) => {
        const currentDate = new Date();
        currentDate.setFullYear(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
        currentDate.setHours(0, 0, 0, 0);
        return this.isSameDate(currentDate, this.selectedDate)
    }

    private isHolidayDate = (day: any) => {
        const currentDate = new Date();

        currentDate.setFullYear(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
        currentDate.setHours(0, 0, 0, 0);
        const isHoliday = this.holidayList.findIndex(holiday => holiday.getTime() === currentDate.getTime());
        if (isHoliday > -1) return "holiday";
        else return ""
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


    private handleClickModeMonth = (month: number) => action((e: any) => {
        const {picker = ModeDatePicker.date, onChange} = this.props;
        const date = new Date(this.currentMonth);
        e.stopPropagation();
        e.preventDefault();

        date.setMonth(month);
        date.setDate(1);
        this.currentMonth = date;
        this.currentYear = this.currentMonth.getFullYear();
        if (picker === ModeDatePicker.month) {
            this.selectedDate = date;
            this.isFocus = false;
            onChange && onChange(this.selectedDate);

        } else {
            this.modeCalendar = ModeDatePicker.date;
        }
    });

    private handleClickModeYear = (year: number, isHeader: boolean = false) => action(() => {
        const {picker = ModeDatePicker.date, onChange} = this.props;

        const date = new Date(this.currentMonth);
        date.setFullYear(year);
        date.setDate(1);
        this.currentMonth = date;

        if (picker === ModeDatePicker.year) {
            if (!isHeader) {
                this.selectedDate = date;
                this.isFocus = false;

                onChange && onChange(this.selectedDate);
            }
        } else {
            if (!isHeader) {
                this.modeCalendar = ModeDatePicker.month;
            }
        }
    });


    @action
    private getDateMonth = (flag: 'curr' | "next" | "prev") => {
        return flag === "curr" ? this.currentMonth.getMonth() : flag === "next" ? this.currentMonth.getMonth() + 1 : this.currentMonth.getMonth() - 1;
    }


    private renderDatePickerCalendar = () => {
        const {picker} = this.props;
        const currMonth = this.currentMonth.getMonth();
        const year = this.currentMonth.getFullYear();

        return <>
            <header>
                <ArrowBack onMouseDown={this.handleClickModeMonth(currMonth - 1)}/>
                <div className={`view`}>
                    <span className={`year`}
                          onMouseDown={action(() => this.modeCalendar = ModeDatePicker.year)}>{year}년</span>
                    <span className={`month`}
                          onMouseDown={action(() => this.modeCalendar = ModeDatePicker.month)}>{CALENDAR_MONTH_KOR[currMonth]}</span>
                </div>
                <ArrowForward onMouseDown={this.handleClickModeMonth(currMonth + 1)}/>

            </header>
            <div className={'body'}>
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

                        return <tr key={`week-${w}`} className={`${picker}`}>
                            {
                                week.map((dateInfo, d) => {
                                    const {date, flag} = dateInfo;
                                    const selectedClass = this.isSelectedDate(date);
                                    const stateClass = ` ${flag === "curr" ? "date-in-view" : ""} `;
                                    const hoverDate = new Date(this.currentMonth.getFullYear(), this.getDateMonth(flag), date);
                                    const weekClass = this.getWeekClass(flag, year, date);
                                    const holidayClass = this.isHolidayDate(date);

                                    return <td key={`date-${d}`}
                                               onMouseOver={picker === ModeDatePicker.week ?
                                                   action(() => {
                                                       this.hoverWeek = modeYearWeeks(hoverDate, year)
                                                   }) : undefined}
                                               onMouseLeave={picker === ModeDatePicker.week ? action(() => this.hoverWeek = 0) : undefined}
                                               className={`${stateClass} ${selectedClass} ${weekClass} ${holidayClass}`}
                                               onMouseDown={this.handleClickModeDate(date, w)}>
                                        {date}
                                    </td>
                                })
                            }
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        </>
    }

    private renderMonthPickerCalendar = () => {
        const year = this.currentMonth.getFullYear();
        const currMonth = this.currentMonth.getMonth();

        return <>
            <header>
                <ArrowBack onMouseDown={this.handleClickModeYear(year - 1, true)}/>
                <div className={`view`}>
                    <span>{year}년</span>
                </div>
                <ArrowForward onMouseDown={this.handleClickModeYear(year + 1, true)}/>
            </header>
            <div className={'body'}>
                <table className={'picker-content'}>
                    <tbody>
                    {this.modeMonthsAndYears.map((month, m) => {
                        return <tr key={`month-${m}`}>
                            {month.map((monthIdx) => {
                                return <td key={`month-td-${monthIdx}`}
                                           className={`${currMonth === monthIdx ? "curr" : ""} `}
                                           onMouseDown={this.handleClickModeMonth(monthIdx)}>
                                    {CALENDAR_MONTH_KOR[monthIdx]}
                                </td>
                            })}
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        </>
    };

    private renderYearPickerCalendar = () => {
        const currYear = this.currentMonth.getFullYear();
        const selectedYear = this.selectedDate.getFullYear();
        const startYear = Math.floor(currYear / 10) * 10 - 1;

        //get 화 할것
        const rangeYear = Array(12).fill(0).reduce((acc, curr, index) => {
            const year = Number(startYear) + index;
            acc.push(year);
            return acc
        }, []);

        return <>
            <header>
                <ArrowBack onMouseDown={this.handleClickModeYear(startYear, true)}/>
                <div className={`view`}>
                    <span>{rangeYear[1]} - {rangeYear[10]}</span>
                </div>
                <ArrowForward onMouseDown={this.handleClickModeYear(rangeYear[11], true)}/>
            </header>
            <div className={'body'}>
                <table className={'picker-content'}>
                    <tbody>
                    {this.modeMonthsAndYears.map((year, y) => {
                        return <tr key={`year-${y}`}>
                            {year.map((yearIdx: number) => {
                                return <td key={`year-td-${yearIdx}`}
                                           className={`${selectedYear === rangeYear[yearIdx] ? "curr" : ""} ${yearIdx !== 0 && yearIdx !== 11 ? "year-in-view" : ""}`}
                                           onMouseDown={this.handleClickModeYear(rangeYear[yearIdx])}>
                                    {rangeYear[yearIdx]}
                                </td>
                            })}
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        </>
    }

    render() {
        const {focus} = this.props;
        return (
            <div id={`sample-calendar`} className={`${focus ? "focus" : ""}`} onMouseDown={(e) => e.preventDefault()}>
                <div className={`date container  ${this.modeCalendar}`}>
                    {(this.modeCalendar === ModeDatePicker.date || this.modeCalendar === ModeDatePicker.week) ?
                        this.renderDatePickerCalendar()
                        : this.modeCalendar === ModeDatePicker.month ? this.renderMonthPickerCalendar()
                            : this.renderYearPickerCalendar()}

                </div>

            </div>)
    }
}
