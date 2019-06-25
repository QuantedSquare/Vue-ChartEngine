<template>
    <svg :viewBox="'0 0 ' + width + ' ' + height">
        <g :transform="display">
            <g :transform="center">
                <path v-for="(path, i) in displayedPaths" :d="arc(path)" :fill="color(i)" class="arc-path"></path>
            </g>
        </g>
    </svg>
</template>
<script>
import { arc, pie, scaleOrdinal, quantize, interpolateRgbBasis } from 'd3'

let margin = { top: 40, right: 20, bottom: 40, left: 30 };

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
        // let colorInterpolator = interpolateRgb('rgb(162, 255, 174)', 'rgb(12, 204, 249)');
        // let colorInterpolator = interpolateRgb('rgb(172, 1, 207)', 'rgb(255, 18, 120)');

        let _arc = arc().innerRadius(this.radius() - 30)
            .outerRadius(this.radius());

        let _pie = pie().value(d => d.y);

        let color = scaleOrdinal().domain(this.data.map(d => d.x))
            .range(quantize(t => colorInterpolator(t), this.data.length).reverse());

        return {
            arc: _arc,
            pie: _pie,
            displayedPaths: _pie(this.data),
            color: color
        }
    },
    mounted: function() {

    },
    watch: {
        width: function() {
            this.arc.innerRadius(this.radius() - 30)
                .outerRadius(this.radius());
        },
        height: function() {
            this.arc.innerRadius(this.radius() - 30)
                .outerRadius(this.radius());
        },
        data: function() {
            this.displayedPaths = this.pie(this.data);
            this.color.domain(this.data.map(d => d.x))
                .range(quantize(t => colorInterpolator(t), this.data.length).reverse());
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
            return Math.min(this._width(), this._height()) / 2 - 1
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
@import '@/assets/charts.scss';

.arc-path {
    /*fill: $chart-color-2-s100;*/
    stroke: white;
    stroke-width: .5px;
}

.arc-path-label {
    opacity: 0.5;
}

/*.bar:hover {
    fill: $chart-color-4;
}*/
</style>