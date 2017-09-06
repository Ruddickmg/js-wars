export default ["two", "three", "four", "five", "six", "seven", "eight", "preDefined"]
    .reduce((mapping: any, gameType: string, index: any): any => {

        mapping[index + 2] = gameType;

        return mapping;

    }, {});
