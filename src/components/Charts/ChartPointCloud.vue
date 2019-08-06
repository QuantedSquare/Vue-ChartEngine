<template>
    <div>
        <svg :viewBox="'0 0 ' + width + ' ' + height">
            <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <g v-for="cloud in data">
                    <circle v-for="point in cloud.points" :cx="xScale(point.x)" :cy="yScale(point.y)" r="5" :fill="color(cloud.label)" />
                </g>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, scaleLinear, quantize, scaleOrdinal, scaleTime, axisLeft, axisBottom, scan, interpolateRgbBasis } from 'd3'
import { getMin, getMax } from '@/modules/utilities.js'

import * as shapes from 'd3-shape'

let margin = { top: 40, right: 80, bottom: 40, left: 40 };

let colorInterpolator = interpolateRgbBasis([
    'rgb(162, 255, 174)', 'rgb(12, 204, 249)',
    'rgb(172, 1, 207)', 'rgb(255, 18, 120)'
]);

export default {
    name: 'ChartPointCloud',
    props: {
        data: {
            type: Array,
            required: true
        },
        height: {
            type: Number,
            default: 480
        },
        width: {
            type: Number,
            default: 720
        },
        options: {
            type: Object,
            default: function() {
                return {
                    // min: 0 // Fix yScale Min
                    // max: 1000 // Fix yScale Max
                }
            }
        }
    },
    data: function() {
        // console.log(this.data);

        let xScale = scaleLinear(),
            yScale = scaleLinear();

        xScale.range([0, this._width()]);
        xScale.domain([this.getMin('x'), this.getMax('x')]);

        yScale.range([this._height(), 0]);
        yScale.domain([this.getMin('y'), this.getMax('y')]);

        let color = scaleOrdinal().domain(this.data.map(cloud => cloud.label))
            .range(quantize(t => colorInterpolator(t), this.data.length).reverse());

        return {
            xScale: xScale,
            yScale: yScale,
            color: color
        }
    },
    mounted: function() {
        this.drawXAxis();
        this.drawYAxis();
    },
    watch: {
        width: function() {
            this.xScale.range([0, this._width()]);
            this.drawXAxis();
        },
        height: function() {
            this.yScale.range([this._height(), 0]);
            this.drawYAxis();
        },
        data: function() {
            this.color.domain(this.data.map(cloud => cloud.label))
                .range(quantize(t => colorInterpolator(t), this.data.length).reverse());
        },
        xMax: function() {
            this.xScale.domain([this.getMin('x'), this.getMax('x')]);
            this.drawXAxis();
        },
        yMax: function() {
            this.yScale.domain([this.getMin('y'), this.getMax('y')]);
            this.drawYAxis();
        },
        xMin: function() {
            this.xScale.domain([this.getMin('x'), this.getMax('x')]);
            this.drawXAxis();
        },
        yMin: function() {
            this.yScale.domain([this.getMin('y'), this.getMax('y')]);
            this.drawYAxis();
        }
    },
    methods: {
        drawXAxis: function() {
            select('#xAxis').call(axisBottom(this.xScale))
        },
        drawYAxis: function() {
            select('#yAxis').call(axisLeft(this.yScale))
        },
        _width: function() {
            return this.width - margin.left - margin.right;
        },
        _height: function() {
            return this.height - margin.top - margin.bottom;
        },
        getMax: function(axis) {
            return getMax(this.data, axis, this.options);
        },
        getMin: function(axis) {
            return getMin(this.data, axis, this.options);
        }
    },
    computed: {
        display: function() {
            return 'translate(' + margin.left + ',' + margin.top + ')';
        },
        bottomTranslate: function() {
            return 'translate(0,' + this._height() + ')'
        },
        xMax: function() {
            return this.getMax('x');
        },
        yMax: function() {
            return this.getMax('y');
        },
        xMin: function() {
            return this.getMin('x');
        },
        yMin: function() {
            return this.getMin('y')
        }
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '@/assets/charts.scss';

.line {
    fill: none;
    /*stroke: $chart-color-4-s40;*/
    stroke-width: 1.5px;
}

.event-line {
    stroke-dasharray: 10;
    stroke-opacity: 0.5;
}

.event-label {
    opacity: 0.5;
}

.line-label {
    opacity: 0.5;
}
</style>