import { min, max } from 'd3'

export function getMax(data, axis, chartOptions = {}) {
    let fixed = axis == 'y' && typeof(chartOptions.max) == 'number';

    return fixed ? chartOptions.max : max(data.map(line => {
        return max(line.points, (d) => d[axis]);
    }));
}

export function getMin(data, axis, chartOptions) {
    let fixed = axis == 'y' && typeof(chartOptions.min) == 'number';

    return fixed ? chartOptions.min : min(data.map(line => {
        return min(line.points, (d) => d[axis]);
    }));
}

export function getIMG(svgEl) {
    let xml = new XMLSerializer().serializeToString(svgEl);

    // console.log(xml)

    return btoa(xml);
}