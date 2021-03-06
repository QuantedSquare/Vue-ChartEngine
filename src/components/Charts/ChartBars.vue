<template>
    <svg :viewBox="'0 0 ' + width + ' ' + height">
        <g :transform="display">
            <g>
                <slot name="top" v-bind="{$data, yMin, yMax}"></slot>
            </g>
            <g id="xAxis" :transform="bottomTranslate"></g>
            <g id="yAxis"></g>
            <rect class="bar" :fill="color" v-for="point in displayedBars" :x="xScale(point.x)" :y="yScale(point.y)" :width="xScale.bandwidth()" :height="positiveOrZero(_height() - yScale(point.y))"></rect>
            <text v-for="point in displayedBars" :x="xScale(point.x) + (xScale.bandwidth()/2)" :y="yScale(point.y) - 5" text-anchor="middle" :opacity="animationState()-0.5">{{point.label}}</text>
            <g>
                <slot v-bind="{$data, yMin, yMax}"></slot>
            </g>
        </g>
    </svg>
</template>
<script>
import { select, scaleLinear, scaleBand, min, max, interpolateObject, axisLeft, axisBottom } from 'd3'

let margin = { top: 40, right: 20, bottom: 40, left: 30 };

export default {
    name: 'ChartBars',
    props: {
        data: {
            type: Array,
            required: true
        },
        min: Number, // Fix yAxix Min
        max: Number, // Fix yAxis Max
        animationTime: {
            type: Number,
            default: 1000
        },
        height: {
            type: Number,
            default: 480
        },
        width: {
            type: Number,
            default: 720
        },
        xAxis: {
            type: Boolean,
            default: true
        },
        yAxis: {
            type: Boolean,
            default: true
        },
        color: {
            type: String,
            // default: '#0CCCF9'
            default: '#FF1278'
        }
    },
    data: function() {
        // console.log(this.data);

        let xScale = scaleBand(),
            yScale = scaleLinear();

        let yMax = this.getMax('y');

        margin.left = (yMax.toString().length + 1) * 10;

        xScale.range([0, this._width()]);
        xScale.domain(this.data.map(point => point.x));
        xScale.padding(0.2)

        yScale.range([this._height(), 0]);
        yScale.domain([this.getMin('y'), yMax]);

        return {
            xScale: xScale,
            yScale: yScale,
            renderedBars: this.data,
            interpolatedBars: this.data.map(b => interpolateObject({ x: b.x, y: 0 }, b)),
            displayedBars: [],
            startAnimation: Date.now()
        }
    },
    mounted: function() {
        this.drawXAxis();
        this.drawYAxis();

        setTimeout(this.animate, 100);
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
        data: function() {
            this.startAnimation = Date.now();
            this.interpolatedBars = this.data.map(bar => {
                let _bar = this.renderedBars.find(b => b.x == bar.x);
                if (!_bar) _bar = { x: bar.x, y: this.getMax('y') }
                return interpolateObject(_bar, bar);
            });

            this.renderedBars = this.data;

            this.xScale.domain(this.data.map(point => point.x));
            this.yScale.domain([this.yMin, this.yMax]);
            this.drawXAxis(true);
            this.drawYAxis(true);

            this.animate();
        }
    },
    methods: {
        animate: function() {
            this.displayedBars = this.interpolatedBars.map(interpolatedBar => {
                return interpolatedBar(this.animationState());
            });

            if (this.animationState() < 1) setTimeout(this.animate, 0);
        },
        animationState: function() {
            if ((this.startAnimation + this.animationTime) > Date.now()) {
                return (Date.now() - this.startAnimation) / this.animationTime;
            } else {
                return 1;
            }
        },
        drawXAxis: function(withTransition) {
            let axis = select(this.$el).select('#xAxis');

            if (withTransition) axis = axis.transition().duration(500);

            if (this.xAxis) axis.call(axisBottom(this.xScale));
        },
        drawYAxis: function(withTransition) {
            let axis = select(this.$el).select('#yAxis');

            if (withTransition) axis = axis.transition().duration(500);

            if (this.yAxis) axis.call(axisLeft(this.yScale));
        },
        _width: function() {
            return this.width - margin.left - margin.right;
        },
        _height: function() {
            return this.height - margin.top - margin.bottom;
        },
        getMax: function(axis) {
            return this.max ? this.max : max(this.data, (d) => d[axis]);
        },
        getMin: function(axis) {
            return !!(this.min + 1) ? this.min : min(this.data, (d) => d[axis]);
        },
        positiveOrZero: function(nb) {
            return nb > 0 ? nb : 0;
        }
    },
    computed: {
        display: function() {
            return 'translate(' + margin.left + ',' + margin.top + ')';
        },
        bottomTranslate: function() {
            return 'translate(0,' + this._height() + ')'
        },
        yMax: function() {
            return this.getMax('y');
        },
        yMin: function() {
            return this.getMin('y');
        }
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bar {
    /*fill: $chart-color-2-s100;*/
    stroke: none;
    /*stroke-width: 1.5px;*/
}

.bar-label {
    opacity: 0.5;
}

/*.bar:hover {
    fill: $chart-color-4;
}*/
</style>