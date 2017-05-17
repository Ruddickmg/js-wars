export interface Time {

    seconds(seconds: number): number;
    minutes(minutes: number): number;
    hours(hours: number): number;
    days(days: number): number;
    years(years: number): number;
    wait(time: number): Promise<void>;
}

export default function(): Time {

    const millisecondsInASecond: number = 1000;
    const secondsInAMinute: number = 60;
    const minutesInAnHour: number = 60;
    const hoursInADay: number = 24;
    const daysInAYear: number = 365;
    const seconds = (amountOfSeconds: number): number => amountOfSeconds * millisecondsInASecond;
    const minutes = (amountOfMinutes: number): number => amountOfMinutes * seconds(secondsInAMinute);
    const hours = (amountOfHours: number): number => amountOfHours * minutes(minutesInAnHour);
    const days = (amountOfDays: number): number => amountOfDays * hours(hoursInADay);

    return {
        seconds,
        minutes,
        hours,
        days,
        years: (years: number): number => years * days(daysInAYear),
        wait(timeInMilliseconds: number = 0): Promise<void> {

            return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
        },
    };
}