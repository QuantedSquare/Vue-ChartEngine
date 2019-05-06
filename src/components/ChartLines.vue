<template>
    <div>
        <div v-if="title">
            <span>{{title}}</span>
        </div>
        <div v-else>
            <span>xMax: {{xMax}}, yMax: {{yMax}}, xMin: {{xMin}}, yMin: {{yMin}}</span>
        </div>
        <svg :height="height" :width="width">
            <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <path class="line" v-for="(line, index) in lines" :d="lineDrawer(line)" :style="`stroke:`+ colorLine(index)"></path>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, scaleLinear, min, max, axisLeft, axisBottom, scaleTime, schemeCategory10, scaleOrdinal } from 'd3'
import * as shapes from 'd3-shape'

let margin = { top: 20, right: 20, bottom: 20, left: 30 };

export default {
    name: 'ChartLines',
    props: {
        lines: {
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
        curve: {
            type: String,
            default: 'curveBasis'
        },
        scale: {
            type: String,
            default: 'linear'
        },
        title: {
            type: String,
            default: null
        }
    },
    data: function() {
        console.log(this.lines);

        let colorScale = scaleOrdinal(schemeCategory10);

        let xScale = this.scale === "linear" ? scaleLinear() : scaleTime(),
            yScale = scaleLinear();

        let lineDrawer = shapes.line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(shapes[this.curve])

        xScale.range([0, this._width()]);
        xScale.domain([this.getMin('x'), this.getMax('x')]);

        yScale.range([this._height(), 0]);
        yScale.domain([this.getMin('y'), this.getMax('y')]);

        return {
            xScale: xScale,
            yScale: yScale,
            lineDrawer: lineDrawer,
            colorLine: colorScale
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
        curve: function() {
            this.lineDrawer.curve(shapes[this.curve]);
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
            return max(this.lines.map(line => {
                return max(line, (d) => d[axis]);
            }));
        },
        getMin: function(axis) {
            return min(this.lines.map(line => {
                return min(line, (d) => d[axis]);
            }));
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
<style scoped>
.line {
    fill: none;
    stroke: steelblue;
    stroke-width: 1.5px;
}
</style>