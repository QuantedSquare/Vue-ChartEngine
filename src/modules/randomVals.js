export function randomVal(min, max) {
    return min + Math.round(Math.random() * (max - min));
}

let oneDay = 1000 * 60 * 60 * 24;

export function points(length = 10, yMin = 0, yMax = 10, isTime) {
    return new Array(length).fill().map((p, x) => {
        let xVal = isTime ? (new Date(Date.now() + (x * oneDay))) : x;

        return {
            x: xVal,
            y: randomVal(yMin, yMax),
            label: 'Point ' + (x + 1)
        }
    });
}

export function collection(nbLines = 3, nbPoints, yMin, yMax, isTime) {
    return new Array(nbLines).fill().map((l, i) => {
        return {
            points: points(nbPoints, yMin, yMax, isTime),
            label: 'Line ' + (i + 1)
        }
    });
}