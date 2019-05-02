<template>
    <div>
        <div>
            <span>yMax: {{yMax}}, yMin: {{yMin}}</span>
        </div>
        <svg :height="height" :width="width">
            <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <rect class="bar" v-for="point in displayedBars" :x="xScale(point.x)" :y="_height() - yScale(point.y)" :width="xScale.bandwidth()" :height="positiveOrZero(yScale(point.y))"></rect>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, scaleLinear, scaleBand, min, max, interpolateObject, axisLeft, axisBottom } from 'd3'

let margin = { top: 20, right: 20, bottom: 20, left: 30 };

export default {
    name: 'ChartLines',
    props: {
        bars: {
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
        animationTime: {
            type: Number,
            default: 1000
        }
    },
    data: function() {
        console.log(this.bars);

        let xScale = scaleBand(),
            yScale = scaleLinear();

        xScale.range([0, this._width()]);
        xScale.domain(this.bars.map(point => point.x));
        xScale.padding(0.2)

        yScale.range([this._height(), 0]);
        yScale.domain([this.getMin('y'), this.getMax('y')]);

        return {
            xScale: xScale,
            yScale: yScale,
            renderedBars: this.bars,
            interpolatedBars: this.bars.map(b => interpolateObject({ x: b.x, y: this.getMax('y') }, b)),
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
        bars: function() {
            this.startAnimation = Date.now();
            this.interpolatedBars = this.bars.map(bar => {
                let _bar = this.renderedBars.find(b => b.x == bar.x);
                if (!_bar) _bar = { x: bar.x, y: this.getMax('y') }
                return interpolateObject(_bar, bar);
            });

            this.renderedBars = this.bars;

            this.xScale.domain(this.bars.map(point => point.x));
            this.yScale.domain([this.yMin, this.yMax]);
            this.drawXAxis(true);
            this.drawYAxis(true);

            this.animate();
        }
    },
    methods: {
        animate: function() {
            if (this.animationState() < 1) {
                this.displayedBars = this.interpolatedBars.map(interpolatedBar => {
                    return interpolatedBar(this.animationState());
                });

                setTimeout(this.animate, 0);
            }
        },
        animationState: function() {
            if ((this.startAnimation + this.animationTime) > Date.now()) {
                return (Date.now() - this.startAnimation) / this.animationTime;
            } else {
                return 1;
            }
        },
        drawXAxis: function(withTransition) {
            let axis = select('#xAxis');

            if (withTransition) axis = axis.transition().duration(500);

            axis.call(axisBottom(this.xScale));
        },
        drawYAxis: function(withTransition) {
            let axis = select('#yAxis');

            if (withTransition) axis = axis.transition().duration(500);

            axis.call(axisLeft(this.yScale));
        },
        _width: function() {
            return this.width - margin.left - margin.right;
        },
        _height: function() {
            return this.height - margin.top - margin.bottom;
        },
        getMax: function(axis) {
            return max(this.bars, (d) => d[axis]);
        },
        getMin: function(axis) {
            return min(this.bars, (d) => d[axis]);
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
    fill: steelblue;
    /*stroke: steelblue;*/
    /*stroke-width: 1.5px;*/
}
</style>