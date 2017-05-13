export interface Time {

    seconds(number): number,
    minutes(number): number,
    hours(number): number,
    days(number): number,
    years(number): number,
    wait(number): Promise<void>
}

export default function (): Time {

    const
        millisecondsInASecond: number = 1000,
        secondsInAMinute: number = 60,
        minutesInAnHour: number = 60,
        hoursInADay: number = 24,
        daysInAYear: number = 365,
        seconds = (seconds: number): number => seconds * millisecondsInASecond,
        minutes = (minutes: number): number => minutes * seconds(secondsInAMinute),
        hours = (hours: number): number => hours * minutes(minutesInAnHour),
        days = (days: number): number => days * hours(hoursInADay);

    return {
        seconds,
        minutes,
        hours,
        days,
        years: (years: number): number => years * days(daysInAYear),
        wait(timeInMilliseconds: number=0): Promise<void> {

            return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
        }
    };
}