<template>
    <svg :viewBox="'0 0 ' + width + ' ' + height">
        <g :transform="display">
            <g :transform="center">
                <template v-for="(displayedArc, i) in displayedArcs">
                    <g @mouseover="showHighlight(i)" @mouseleave="hideHighlight" class="path-group">
                        <path :d="displayedArc.arc(displayedArc.angle)" :fill="color(i)" class="arc-path"></path>
                    </g>
                </template>
                <text class="highlight-val" text-anchor="middle">
                    {{centerData.val}}
                </text>
                <text y="24" class="highlight-text" text-anchor="middle">
                    {{centerData.text}}
                </text>
            </g>
        </g>
    </svg>
</template>
<script>
import { arc, pie, scaleOrdinal, quantize, interpolateRgbBasis, sum } from 'd3'

let margin = { top: 40, right: 20, bottom: 40, left: 20 };

export default {
    name: 'ChartGauges',
    props: {
        data: {
            type: Array,
            required: true
        },
        max: {
            type: Number,
            default: 100
        },
        bandWidth: {
            type: Function,
            default: function() {
                return 20;
            }
        },
        height: {
            type: Number,
            default: 480
        },
        width: {
            type: Number,
            default: 720
        },
        cornerRadius: Number,
        innerRadius: {
            type: Function,
            default: function(point, pointIndex, radius) {
                return radius - (pointIndex + 1) * 30;
            }
        },
        outerRadius: {
            type: Function,
            default: function(point, pointIndex, radius) {
                return radius - pointIndex * 30;
            }
        },
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
        let colorInterpolator = interpolateRgbBasis(this.colors);

        let color = scaleOrdinal().domain(this.data.map(d => d.x))
            .range(quantize(t => colorInterpolator(t), this.data.length));

        return {
            colorInterpolator: colorInterpolator,
            color: color,
            centerData: {
                val: this.data[0].y,
                text: this.data[0].label
            }
        }
    },
    mounted: function() {

    },
    watch: {
        width: function() {},
        height: function() {},
        data: function() {
            this.color.domain(this.data.map(d => d.x))
                .range(quantize(t => this.colorInterpolator(t), this.data.length));

            this.hideHighlight();
        }
    },
    methods: {
        _width: function() {
            return this.width - margin.left - margin.right;
        },
        _height: function() {
            return this.height - margin.top - margin.bottom;
        },
        radius: function() {
            return Math.min(this._width(), this._height()) / 2;
        },
        showHighlight: function(pointIndex) {
            this.centerData = {
                val: this.data[pointIndex].y,
                text: this.data[pointIndex].label
            };
        },
        hideHighlight: function() {
            this.centerData = {
                val: this.data[0].y,
                text: this.data[0].label
            }
        },
        getPointArc: function(point, pointIndex) {
            let pointArc = arc().innerRadius(this.innerRadius(point, pointIndex, this.radius()))
                .outerRadius(this.outerRadius(point, pointIndex, this.radius()));

            if (this.cornerRadius) pointArc.cornerRadius(this.cornerRadius);

            return pointArc;
        },
        getEndAngle: function(value) {
            return (value / this.max) * (2 * Math.PI)
        }
    },
    computed: {
        display: function() {
            return 'translate(' + margin.left + ',' + margin.top + ')';
        },
        center: function() {
            return 'translate(' + (this._width() / 2) + ',' + (this._height() / 2) + ')';
        },
        displayedArcs: function() {
            let arcs = this.data.map((point, pointIndex) => {
                return {
                    // TODO --> Change this by scaleBand. Or decreasing scaleBand.
                    arc: this.getPointArc(point, pointIndex),
                    angle: {
                        startAngle: 0,
                        endAngle: this.getEndAngle(point.y)
                    },
                    label: point.label
                }
            })

            return arcs;
        }
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.arc-path {
    /*fill: $chart-color-2-s100;*/
    stroke: white;
    stroke-width: .5px;
}

.pie-label {
    /*opacity: 0.5;*/
    font-size: 12px;
    /*color: white;*/
}

.path-group {
    cursor: pointer;
}

.highlight-val {
    font-size: 48px;
}

.highlight-text {
    font-size: 12px;
    opacity: 0.7;
}
</style>