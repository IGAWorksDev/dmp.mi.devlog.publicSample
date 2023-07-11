import exp from "constants";

export function modeYearWeeks(date: Date,year:number, dowOffset=1)  {
    let newYear = new Date(year, 0, 1);
    let day = newYear.getDay() - dowOffset //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    let daynum = Math.floor((date.getTime() - newYear.getTime() -
        (date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    let weeknum;
    if (day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        if (weeknum > 52) {
            let nYear = new Date(date.getFullYear() + 1, 0, 1);
            let nday = nYear.getDay() -dowOffset;
            nday = nday >= 0 ? nday : nday + 7;

            weeknum = nday < 4 ? 1 : 53;
        }
    } else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
}

export function expressionNthWeek(date: Date, year: number)  {
    let unit;
    const nthWeek = modeYearWeeks(date, year);

    const units = nthWeek % 10;
    if (units === 1) {
        unit = 'st'
    } else if (units === 2) {
        unit = 'nd'
    } else if (units === 3) {
        unit = 'rd'
    } else {
        unit = 'th'
    }
    return `${year}-${modeYearWeeks(date, year)}${unit}`
};


export function isExceedMaxRange(rangeDate:Date[],maxRange: number)  {
    const startDate = rangeDate[0];
    const endDate = rangeDate[1]
    const difference = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (difference > maxRange) {
        return true;
    }
    return false;
};