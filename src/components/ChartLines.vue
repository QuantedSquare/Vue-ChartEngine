<template>
    <div>
        <div>
            <span>xMax: {{xMax}}, yMax: {{yMax}}, xMin: {{xMin}}, yMin: {{yMin}}</span>
        </div>
        <svg :height="height" :width="width">
            <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <path class="line" v-for="line in lines" :d="lineDrawer(line)"></path>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, line, scaleLinear, min, max, axisLeft, axisBottom } from 'd3'

let margin = { top: 20, right: 20, bottom: 20, left: 20 };

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
        }
    },
    data: function() {
        console.log(this.lines);

        let xScale = scaleLinear(),
            yScale = scaleLinear();

        let lineDrawer = line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y));

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