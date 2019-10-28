<template>
    <div>
        <svg :viewBox="'0 0 ' + width + ' ' + height" @mousemove="showVals" @mouseleave="hideVals">
            <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <path class="line chart-color4-darken-0" v-for="line in data" :d="lineDrawer(line.points)"></path>
                <text v-for="line in data" :x="xScale(_xMax) + 5" :y="yScale(line.points[line.points.length - 1].y) + 5" class="line-label">{{line.label}}</text>
                <g v-if="events">
                    <text v-for="event in events" :x="xScale(event.x)" :y="yScale(_yMax) - 5" text-anchor="middle" class="event-label">{{event.label}}</text>
                    <line v-for="event in events" class="event-line" :x1="xScale(event.x)" :x2="xScale(event.x)" :y1="yScale(_yMin)" :y2="yScale(_yMax)" stroke="black"></line>
                </g>
                <template v-for="point in readingLine.points">
                    <text v-if="readingLine.active" :x="xScale(point.x)" :y="yScale(point.y) - 5" text-anchor="middle" class="event-label">
                        {{point.y}}
                    </text>
                </template>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, scaleLinear, scaleTime, scaleOrdinal, min, max, axisLeft, axisBottom, scan } from 'd3'
import { getMin, getMax } from '@/modules/utilities.js'
import * as shapes from 'd3-shape'

let margin = { top: 40, right: 100, bottom: 40, left: 40 };

export default {
    name: 'ChartLines',
    props: {
        data: {
            type: Array,
            required: true
        },
        curve: {
            type: String,
            default: 'curveLinear'
        },
        isTime: {
            type: Boolean,
            default: false
        },
        xTickFormat: Function,
        xMin: Number,
        xMax: Number,
        yMin: Number,
        yMax: Number,
        events: Array,
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
        // console.log(this.data[0].points.map(p => p.label));
        let xScale = this.isTime ? scaleTime() : scaleLinear(),
            yScale = scaleLinear();

        let yMax = this.getMax('y');

        margin.left = (yMax.toString().length + 1) * 10;

        let lineDrawer = shapes.line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(shapes[this.curve]);

        xScale.range([0, this._width()]);
        xScale.domain([this.getMin('x'), this.getMax('x')]);;

        yScale.range([this._height(), 0]);
        yScale.domain([this.getMin('y'), yMax]);

        return {
            xScale: xScale,
            yScale: yScale,
            lineDrawer: lineDrawer,
            readingLine: { x: 0, active: false, points: [] }
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
        },
        curve: function() {
            this.lineDrawer.curve(shapes[this.curve]);
        },
        isTime: function() {
            this.xScale = this.isTime ? scaleTime() : scaleLinear();
            this.xScale.range([0, this._width()])
                .domain([this.getMin('x'), this.getMax('x')]);

            this.drawXAxis();
            this.lineDrawer.x((d) => this.xScale(d.x))
        }
    },
    methods: {
        drawXAxis: function() {
            let axis = axisBottom(this.xScale);

            if (!this.isTime && this.xTickFormat) {
                axis.tickFormat(t => {
                    let point = this.data[0].points.find(p => p.x == t);
                    return this.xTickFormat(point, t);
                });
            }

            select(this.$el).select('#xAxis').call(axis)
        },
        drawYAxis: function() {
            select(this.$el).select('#yAxis').call(axisLeft(this.yScale))
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
        showVals: function(event) {
            let svgWidth = event.currentTarget.clientWidth,
                xRatio = this.width / svgWidth,
                xVal = this.xScale.invert((event.offsetX * xRatio) - margin.left);

            this.readingLine.points = this.data.map(line => {
                let x = this.isTime ? +new Date(xVal) : xVal;

                let nearestPoint = scan(line.points, (a, b) => {
                    let aX = this.isTime ? +new Date(a.x) : a.x,
                        bX = this.isTime ? +new Date(b.x) : b.x;

                    return Math.abs(x - aX) - Math.abs(x - bX);
                });

                return line.points[nearestPoint];
            });

            this.readingLine.active = true;
        },
        hideVals: function() {
            this.readingLine.active = false;
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