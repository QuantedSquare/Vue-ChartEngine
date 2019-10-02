import { min, max, sum, ascending, descending } from 'd3'

export function getMax(data, axis, chartOptions = {}) {
    let fixed = typeof(chartOptions[axis + 'Max']) == 'number';

    return fixed ? chartOptions[axis + 'Max'] : max(data.map(line => {
        return max(line.points, (d) => d[axis]);
    }));
}

export function getMin(data, axis, chartOptions) {
    let fixed = typeof(chartOptions[axis + 'Min']) == 'number';

    return fixed ? chartOptions[axis + 'Min'] : min(data.map(line => {
        return min(line.points, (d) => d[axis]);
    }));
}

export function getIMG(svgEl) {
    let xml = new XMLSerializer().serializeToString(svgEl);

    // console.log(xml)

    return btoa(xml);
}

export function sortPoints(points, asc) {
    return points.sort((a, b) => {
        return asc ? ascending(a.y, b.y) : descending(a.y, b.y);
    });
}

export function aggregatePoints(points, aggregationPortion, labelVal = 'y') {
    let total = sum(points, point => point.y),
        aggregationMax = total * aggregationPortion,
        aggregatedVal = 0,
        aggregationCount = 0;

    sortPoints(points);

    for (var i = points.length - 1; i >= 0; i--) {
        let point = points[i];

        if (aggregatedVal + point.y < aggregationMax) {
            aggregationCount += 1;
            aggregatedVal += point.y;
            points.splice(points.length - 1);
        }
    }

    if (aggregationCount > 0) {
        let label = aggregationCount + ' others';

        points.push({
            x: label,
            y: aggregatedVal,
            label: labelVal == 'y' ? aggregatedVal : label
        });
    }

    return points;
}

export default {
    getMax,
    getMin,
    getIMG,
    sortPoints,
    aggregatePoints
}