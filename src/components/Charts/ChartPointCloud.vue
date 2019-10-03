<template>
    <div>
        <svg ref="svg" :viewBox="'0 0 ' + width + ' ' + height">
            <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <g v-for="cloud in data">
                    <g v-for="point in cloud.points">
                        <circle :style="style.pointCircle" :cx="xScale(point.x)" :cy="yScale(point.y)" r="4" :fill="color(cloud.label)" />
                        <line v-if="xLines" :x1="xScale(_xMin)" :x2="xScale(point.x)" :y1="yScale(point.y)" :y2="yScale(point.y)" :stroke="color(cloud.label)"></line>
                        <line v-if="yLines" :x1="xScale(point.x)" :x2="xScale(point.x)" :y1="yScale(_yMin)" :y2="yScale(point.y)" :stroke="color(cloud.label)"></line>
                        <text class="event-label" :x="xScale(point.x) + 5" :y="yScale(point.y) +5 ">{{point.label}}</text>
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, scaleLinear, quantize, scaleOrdinal, scaleTime, axisLeft, axisBottom, scan, interpolateRgbBasis } from 'd3'
import { getMin, getMax, getIMG } from '@/modules/utilities.js'

import * as shapes from 'd3-shape'

let margin = { top: 40, right: 80, bottom: 40, left: 40 };

let colorInterpolator = interpolateRgbBasis([
    'rgb(162, 255, 174)', 'rgb(12, 204, 249)',
    'rgb(172, 1, 207)', 'rgb(255, 18, 120)'
]);

const style = {
    pointCircle: {
        // stroke: 'black'
    }
}

export default {
    name: 'ChartPointCloud',
    props: {
        data: {
            type: Array,
            required: true
        },
        xMin: Number,
        xMax: Number,
        yMin: Number,
        yMax: Number,
        xLines: {
            type: Boolean,
            default: false
        },
        yLines: {
            type: Boolean,
            default: false
        },
        height: {
            type: Number,
            default: 480
        },
        width: {
            type: Number,
            default: 720
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
            .range(quantize(t => colorInterpolator(t), this.data.length + 1).reverse());

        return {
            xScale: xScale,
            yScale: yScale,
            color: color,
            style: style
        }
    },
    mounted: function() {
        this.drawXAxis();
        this.drawYAxis();

        // TEST IMG
        // setTimeout(() => {
        //     // console.log(this.$refs.img, this.$refs.img.src);
        //     this.$refs.img.src = 'data:image/svg+xml;base64,' + getIMG(this.$refs.svg)
        // }, 0);
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
        _xMax: function() {
            this.xScale.domain([this.getMin('x'), this.getMax('x')]);
            this.drawXAxis();
        },
        _yMax: function() {
            this.yScale.domain([this.getMin('y'), this.getMax('y')]);
            this.drawYAxis();
        },
        _xMin: function() {
            this.xScale.domain([this.getMin('x'), this.getMax('x')]);
            this.drawXAxis();
        },
        _yMin: function() {
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
            return getMax(this.data, axis, { xMax: this.xMax, yMax: this.yMax });
        },
        getMin: function(axis) {
            return getMin(this.data, axis, { xMin: this.xMin, yMin: this.yMin });
        }
    },
    computed: {
        display: function() {
            return 'translate(' + margin.left + ',' + margin.top + ')';
        },
        bottomTranslate: function() {
            return 'translate(0,' + this._height() + ')'
        },
        _xMax: function() {
            return this.getMax('x');
        },
        _yMax: function() {
            return this.getMax('y');
        },
        _xMin: function() {
            return this.getMin('x');
        },
        _yMin: function() {
            return this.getMin('y')
        }
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.event-label {
    opacity: 0.5;
}
</style>