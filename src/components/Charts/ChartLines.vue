<template>
    <div>
        <div>
            <!-- <span>xMax: {{xMax}}, yMax: {{yMax}}, xMin: {{xMin}}, yMin: {{yMin}}</span> -->
        </div>
        <svg :height="height" :width="width">
            <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <path class="line chart-color4-darken-0" v-for="line in data" :d="lineDrawer(line.points)"></path>
                <text v-for="line in data" :x="xScale(xMax) + 5" :y="yScale(line.points[line.points.length - 1].y) + 5" class="line-label">{{line.label}}</text>
                <g v-if="options.events">
                    <text v-for="event in options.events" :x="xScale(event.x)" :y="yScale(yMax) - 5" text-anchor="middle" class="event-label">{{event.label}}</text>
                    <line v-for="event in options.events" class="event-line" :x1="xScale(event.x)" :x2="xScale(event.x)" :y1="yScale(0)" :y2="yScale(yMax)" stroke="black"></line>
                </g>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, scaleLinear, scaleTime, min, max, axisLeft, axisBottom } from 'd3'
import * as shapes from 'd3-shape'

let margin = { top: 40, right: 80, bottom: 20, left: 40 };

export default {
    name: 'ChartLines',
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
                    curve: 'curveLinear',
                    // events: [{x: 2, label: An Event}] // Events create a vertical ligne on the chart.
                    isTime: false
                }
            }
        }
    },
    data: function() {
        // console.log(this.data);

        let xScale = this.options.isTime ? scaleTime() : scaleLinear(),
            yScale = scaleLinear();

        let lineDrawer = shapes.line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(shapes[this.curve()]);

        xScale.range([0, this._width()]);
        xScale.domain([this.getMin('x'), this.getMax('x')]);

        yScale.range([this._height(), 0]);
        yScale.domain([this.getMin('y'), this.getMax('y')]);

        return {
            xScale: xScale,
            yScale: yScale,
            lineDrawer: lineDrawer
        }
    },
    mounted: function() {
        this.drawXAxis();
        this.drawYAxis();
    },
    watch: {
        width: function() {
            this.xScale.range([0, this._width()]);
            this.drawXAxis()
        },
        height: function() {
            this.yScale.range([this._height(), 0]);
            this.drawYAxis();
        },
        xMax: function() {
            this.xScale.domain([this.getMin('x'), this.getMax('x')]);
            this.drawXAxis()
        },
        yMax: function() {
            this.yScale.domain([this.getMin('y'), this.getMax('y')]);
            this.drawYAxis();
        },
        xMin: function() {
            this.xScale.domain([this.getMin('x'), this.getMax('x')]);
            this.drawXAxis()
        },
        yMin: function() {
            this.yScale.domain([this.getMin('y'), this.getMax('y')]);
            this.drawYAxis();
        },
        'options.curve': function() {
            this.lineDrawer.curve(shapes[this.curve()]);
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
            return max(this.data.map(line => {
                return max(line.points, (d) => d[axis]);
            }));
        },
        getMin: function(axis) {
            return min(this.data.map(line => {
                return min(line.points, (d) => d[axis]);
            }));
        },
        curve: function() {
            return this.options.curve || 'curveLinear';
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