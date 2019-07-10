<template>
    <svg :viewBox="'0 0 ' + width + ' ' + height">
        <!-- <defs>
            <filter id="text-background" x="0" y="0" width="1" height="1">
                <feFlood flood-color="black" />
                <feComposite in="SourceGraphic" operator="xor" />
            </filter>
        </defs> -->
        <g :transform="display">
            <g :transform="center">
                <template v-for="(path, i) in displayedPaths">
                    <g @mouseover="showHighlight(i)" @mouseleave="hideHighlight" class="path-group">
                        <path :d="arc(path)" :fill="color(path.index)" class="arc-path"></path>
                        <text v-if="moreThan25(path)" class="pie-label" :transform="arcCentroid(path)" text-anchor="middle">{{path.data.label}}</text>
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

let colorInterpolator = interpolateRgbBasis([
    'rgb(162, 255, 174)', 'rgb(12, 204, 249)',
    'rgb(172, 1, 207)', 'rgb(255, 18, 120)'
]);

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

                }
            }
        }
    },
    data: function() {
        // console.log(_pie(this.data));

        let _arc = arc().innerRadius(this.radius() - 30)
            .outerRadius(this.radius());

        let outerArc = arc().innerRadius(this.radius())
            .outerRadius(this.radius() + 30);

        let _pie = pie().value(d => d.y);

        let color = scaleOrdinal().domain(this.data.map(d => d.x))
            .range(quantize(t => colorInterpolator(t), this.data.length).reverse());

        return {
            arc: _arc,
            outerArc: outerArc,
            pie: _pie,
            displayedPaths: _pie(this.data),
            color: color,
            centerData: { text: 'Total', val: this.total() }
        }
    },
    mounted: function() {

    },
    watch: {
        width: function() {
            this.updateArcs();
        },
        height: function() {
            this.updateArcs();
        },
        data: function() {
            this.displayedPaths = this.pie(this.data);
            this.color.domain(this.data.map(d => d.x))
                .range(quantize(t => colorInterpolator(t), this.data.length).reverse());

            this.hideHighlight();
        }
    },
    methods: {
        updateArcs: function() {
            this.arc.innerRadius(this.radius() - 30)
                .outerRadius(this.radius());

            this.outerArc.innerRadius(this.radius())
                .outerRadius(this.radius() + 30);
        },
        _width: function() {
            return this.width - margin.left - margin.right;
        },
        _height: function() {
            return this.height - margin.top - margin.bottom;
        },
        radius: function() {
            return Math.min(this._width(), this._height()) / 2;
        },
        arcCentroid: function(path) {
            return 'translate(' + this.arc.centroid(path) + ')';
        },
        moreThan25: function(path) {
            return (path.endAngle - path.startAngle) > 0.25
        },
        showHighlight: function(pointIndex) {
            this.centerData = {
                val: this.data[pointIndex].y,
                text: this.data[pointIndex].label
            };
        },
        hideHighlight: function() {
            this.centerData = { text: 'Total', val: this.total() }
        },
        total: function() {
            return sum(this.data, d => d.y);
        }
    },
    computed: {
        display: function() {
            return 'translate(' + margin.left + ',' + margin.top + ')';
        },
        center: function() {
            return 'translate(' + (this._width() / 2) + ',' + (this._height() / 2) + ')';
        }
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
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