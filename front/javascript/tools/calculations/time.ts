import single from "../storage/singleton";

export interface Time {

    seconds(seconds: number): number;
    minutes(minutes: number): number;
    hours(hours: number): number;
    days(days: number): number;
    years(years: number): number;
    wait(milliseconds: number): Promise<any>;
}

export default single<Time>(function(): Time {

    const millisecondsInASecond: number = 1000;
    const secondsInAMinute: number = 60;
    const minutesInAnHour: number = 60;
    const hoursInADay: number = 24;
    const daysInAYear: number = 365;
    const seconds = (numberOfSeconds: number): number => numberOfSeconds * millisecondsInASecond;
    const minutes = (numberOfMinutes: number): number => numberOfMinutes * seconds(secondsInAMinute);
    const hours = (numberOfHours: number): number => numberOfHours * minutes(minutesInAnHour);
    const days = (numberOfDays: number): number => numberOfDays * hours(hoursInADay);
    const years = (numberOfYears: number): number => numberOfYears * days(daysInAYear);

    return {

        seconds,
        minutes,
        hours,
        days,
        years,
        wait(timeInMilliseconds: number= 0): Promise<any> {

            return new Promise((resolve) => {

                const timeOut: any = setTimeout(() => resolve(timeOut), timeInMilliseconds);
            });
        },
    };
});
