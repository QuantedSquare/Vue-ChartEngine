<template>
    <div>
        <svg :viewBox="'0 0 ' + width + ' ' + height">
            <g :transform="display">
                <g>
                    <slot name="top" v-bind="{$data, yMin, yMax}"></slot>
                </g>
                <g v-for="(bar, barIndex) in renderedBars">
                    <rect class="bar" v-for="point in bar.points" :fill="color(point.label || point.x)" :x="yScale(point.offset)" :y="xScale(barIndex)" :width="yScale(point.y)" :height="xScale.bandwidth()"></rect>
                </g>
                <g id="yAxis" :transform="bottomTranslate"></g>
                <g id="xAxis"></g>
                <g>
                    <slot v-bind="{$data, yMin, yMax}"></slot>
                </g>
            </g>
        </svg>
    </div>
</template>
<script>
import { select, quantize, scaleLinear, scaleBand, scaleOrdinal, min, max, sum, interpolateObject, interpolateRgbBasis, axisLeft, axisBottom } from 'd3'
import { getMin, getMax } from '@/modules/utilities.js'


let margin = { top: 40, right: 20, bottom: 40, left: 30 };

export default {
    name: 'ChartBars',
    props: {
        data: {
            type: Array,
            required: true
        },
        min: Number, // Fix yAxix Min
        max: 0, // Fix yAxis Max
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
        // color: {
        //     type: String,
        //     // default: '#0CCCF9'
        //     default: '#FF1278'
        // },
        colors: {
            type: Array,
            default: function() {
                return [
                    'rgb(162, 255, 174)', 'rgb(12, 204, 249)',
                    'rgb(172, 1, 207)', 'rgb(255, 18, 120)'
                ]
            }
        }
    },
    data: function() {
        // console.log(this.data);

        let xScale = scaleBand(),
            yScale = scaleLinear();

        let yMax = this.getMax('y');

        margin.left = (yMax.toString().length + 1) * 10;

        xScale.range([0, this._height()]);
        xScale.domain(this.data.map((bar, i) => i));
        xScale.padding(0.2)

        yScale.range([0, this._width()]);
        yScale.domain([this.getMin('y'), yMax]);

        let colorInterpolator = interpolateRgbBasis(this.colors);

        let barsLabels = this.getBarsLabels();

        let color = scaleOrdinal().domain(barsLabels)
            .range(quantize(t => colorInterpolator(t), barsLabels.length));

        return {
            xScale: xScale,
            yScale: yScale,
            displayedBars: [],
            colorInterpolator: colorInterpolator,
            color: color
        }
    },
    mounted: function() {
        this.drawXAxis();
        this.drawYAxis();

        setTimeout(this.animate, 100);
    },
    watch: {
        width: function() {
            this.yScale.range([0, this._width()]);
            this.drawYAxis();
        },
        height: function() {
            this.xScale.range([0, this._height()]);
            this.drawXAxis();
        },
        data: function() {
            let barsLabels = this.getBarsLabels();

            this.color.domain(barsLabels)
                .range(quantize(t => this.colorInterpolator(t), barsLabels.length));

            this.xScale.domain(this.data.map((bar, i) => i));
            this.yScale.domain([this.yMin, this.yMax]);
            this.drawXAxis(true);
            this.drawYAxis(true);
        }
    },
    methods: {
        drawXAxis: function(withTransition) {
            let axis = select(this.$el).select('#xAxis');

            if (withTransition) axis = axis.transition().duration(500);

            if (this.xAxis) axis.call(axisLeft(this.xScale));
        },
        drawYAxis: function(withTransition) {
            let axis = select(this.$el).select('#yAxis');

            if (withTransition) axis = axis.transition().duration(500);

            if (this.yAxis) axis.call(axisBottom(this.yScale));
        },
        _width: function() {
            return this.width - margin.left - margin.right;
        },
        _height: function() {
            return this.height - margin.top - margin.bottom;
        },
        getMax: function(axis) {
            if (!this.max) {
                return max(this.data.map(bar => {
                    return sum(bar.points, p => p[axis]);
                }));
            } else return this.max;
        },
        getMin: function(axis) {
            if (!this.min && this.min !== 0) {
                return min(this.data.map(bar => {
                    return sum(bar.points, p => p[axis]);
                }))
            } else return this.min;
        },
        positiveOrZero: function(nb) {
            return nb > 0 ? nb : 0;
        },
        getBarsLabels: function() {
            return this.data.reduce((labels, bar) => {
                labels.push(...bar.points.map(p => p.label || p.x).filter(label => {
                    return labels.indexOf(label) < 0;
                }));

                return labels;
            }, []);
        }
    },
    computed: {
        renderedBars: function() {
            return this.data.map(bar => {
                let points = bar.points.reduce((_points, point, pointIndex) => {
                    point.offset = sum(_points, p => p.y);

                    _points.push(point);
                    return _points;
                }, []);

                return {
                    label: bar.label,
                    points: points
                }
            });
        },
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