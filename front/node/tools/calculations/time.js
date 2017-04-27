"use strict";

function time() {

    const
        millisecondsInASecond = 1000,
        secondsInAMinute = 60,
        minutesInAnHour = 60,
        hoursInADay = 24,
        daysInAYear = 365,
        seconds = (seconds) => seconds * millisecondsInASecond,
        minutes = (minutes) => minutes * seconds(secondsInAMinute),
        hours = (hours) => hours * minutes(minutesInAnHour),
        days = (days) => days * hours(hoursInADay),
        years = (years) => years * days(daysInAYear);

    return {seconds, minutes, hours, days, years, wait: (timeInMilliseconds=0) => {

        return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
    }};
}

module.exports = time;