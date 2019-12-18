<template>
    <svg ref="svg" :viewBox="'0 0 ' + width + ' ' + height">
        <g :transform="display">
            <g>
                <slot name="top" v-bind="{$data, _xMin, _xMax, _yMin, _yMax}"></slot>
            </g>
            <g id="xAxis" :transform="bottomTranslate"></g>
            <g id="yAxis"></g>
            <g v-for="cloud in data">
                <g v-for="point in cloud.points" @mouseenter="mouseEnter" @mouseleave="mouseLeave" class="point-group" :class="highlight ? 'hide' : ''">
                    <circle :style="style.pointCircle" :cx="xScale(point.x)" :cy="yScale(point.y)" r="4" :fill="color(cloud.label)" />
                    <line v-if="xLines" :x1="xScale(_xMin)" :x2="xScale(point.x) - r" :y1="yScale(point.y)" :y2="yScale(point.y)" :stroke="color(cloud.label)"></line>
                    <line v-if="yLines" :x1="xScale(point.x)" :x2="xScale(point.x)" :y1="yScale(_yMin)" :y2="yScale(point.y) - r" :stroke="color(cloud.label)"></line>
                    <text v-if="pointsLabels" class="event-label" :x="xScale(xLabel(point)) + 5" :y="yScale(yLabel(point)) -3" :text-anchor="labelAnchor" :fill="coloredLabels ? color(cloud.label) : ''">{{point.label}}</text>
                </g>
            </g>
            <g>
                <slot v-bind="{$data, _xMin, _xMax, _yMin, _yMax}"></slot>
            </g>
        </g>
    </svg>
</template>
<script>
import { select, scaleLinear, quantize, scaleOrdinal, scaleTime, axisLeft, axisBottom, scan, interpolateRgbBasis } from 'd3'
import { getMin, getMax, getIMG } from '@/modules/utilities.js'

import * as shapes from 'd3-shape'

let margin = { top: 40, right: 80, bottom: 40, left: 40 };

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
        r: {
            type: Number,
            default: 4
        },
        xLines: {
            type: Boolean,
            default: false
        },
        yLines: {
            type: Boolean,
            default: false
        },
        xAxis: {
            type: Boolean,
            default: true
        },
        yAxis: {
            type: Boolean,
            default: true
        },
        pointsLabels: Boolean,
        colors: {
            type: Array,
            default: function() {
                return [
                    'rgb(162, 255, 174)', 'rgb(12, 204, 249)',
                    'rgb(172, 1, 207)', 'rgb(255, 18, 120)'
                ]
            }
        },
        coloredLabels: false,
        xLabel: {
            type: Function,
            default: function(point) {
                return point.x;
            }
        },
        yLabel: {
            type: Function,
            default: function(point) {
                return point.y;
            }
        },
        labelAnchor: {
            type: String,
            default: 'left'
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

        let colorInterpolator = interpolateRgbBasis(this.colors);

        let color = scaleOrdinal().domain(this.data.map(cloud => cloud.label))
            .range(quantize(t => colorInterpolator(t), this.data.length + 1));

        return {
            xScale: xScale,
            yScale: yScale,
            color: color,
            style: style,
            highlight: false
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
        data: function() {
            this.color.domain(this.data.map(cloud => cloud.label))
                .range(quantize(t => colorInterpolator(t), this.data.length + 1));
        },
        width: function() {
            this.xScale.range([0, this._width()]);
            this.drawXAxis();
        },
        height: function() {
            this.yScale.range([this._height(), 0]);
            this.drawYAxis();
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
            if (this.xAxis) select(this.$el).select('#xAxis').call(axisBottom(this.xScale))
        },
        drawYAxis: function() {
            if (this.yAxis) select(this.$el).select('#yAxis').call(axisLeft(this.yScale))
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
        },
        mouseEnter: function() {
            this.highlight = true;
        },
        mouseLeave: function() {
            this.highlight = false;
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
<style scoped>
.event-label {
    opacity: 0.5;
}

g.point-group {
    cursor: pointer;
}

g.hide>.event-label,
g.hide>line,
g.hide>circle {
    opacity: 0.25;
}

g:hover>.event-label,
g:hover>line,
g:hover>circle {
    opacity: 1 !important;
}
</style>