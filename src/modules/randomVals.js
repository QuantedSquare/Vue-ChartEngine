export function randomVal(min, max) {
    return min + Math.round(Math.random() * (max - min));
}

export function points(length = 10, yMin = 0, yMax = 10) {
    return new Array(length).fill().map((p, x) => {
        return {
            x: x,
            y: randomVal(yMin, yMax),
            label: 'Point ' + (x + 1)
        }
    });
}

export function collection(nbLines = 3, nbPoints, yMin, yMax) {
    return new Array(nbLines).fill().map((l, i) => {
        return {
            points: points(nbPoints, yMin, yMax),
            label: 'Line ' + (i + 1)
        }
    });
}