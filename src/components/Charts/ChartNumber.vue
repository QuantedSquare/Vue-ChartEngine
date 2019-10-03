<template>
    <svg :viewBox="'0 0 ' + width + ' ' + height">
        <g :transform="display">
            <text class="big-number" text-anchor="middle" :textLength="textLength" :transform="center">{{displayedString}}</text>
        </g>
    </svg>
</template>
<script>
import { interpolateNumber, scaleBand } from 'd3'
// import * as shapes from 'd3-shape'

let margin = { top: 0, right: 0, bottom: 0, left: 0 };

function round(nb, precision) {
    let precisionFactor = Math.pow(10, precision);

    return Math.round(nb * precisionFactor) / precisionFactor;
}

export default {
    name: 'ChartNumber',
    props: {
        data: {
            type: Number,
            required: true
        },
        animationTime: {
            type: Number,
            default: 2000
        },
        initialValue: {
            type: Number,
            default: 0
        },
        decimalPrecision: {
            type: Number,
            default: 0
        },
        unit: String,
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
        // console.log(this.data, this);
        let start = this.initialValue || 0;

        // console.log(this.data);

        let xScale = scaleBand();

        xScale.range([0, this._width() / 2]);
        xScale.padding(0.05)

        return {
            interpolatedNumber: interpolateNumber(start, this.data),
            displayedNumber: start,
            startAnimation: Date.now(),
            xScale: xScale
        }
    },
    mounted: function() {
        setTimeout(this.animate, 100);
    },
    watch: {
        data: function() {
            this.startAnimation = Date.now();

            this.interpolatedNumber = interpolateNumber(this.displayedNumber, this.data);

            this.animate();
        }
    },
    methods: {
        animate: function() {
            let animatedNumber = this.interpolatedNumber(this.animationState());

            this.displayedNumber = round(animatedNumber, this.decimalPrecision);

            if (this.animationState() < 1) setTimeout(this.animate, 0);
        },
        animationState: function() {
            if ((this.startAnimation + this.animationTime) > Date.now()) {
                return (Date.now() - this.startAnimation) / this.animationTime;
            } else {
                return 1;
            }
        },
        _width: function() {
            return this.width - margin.left - margin.right;
        },
        _height: function() {
            return this.height - margin.top - margin.bottom;
        }
    },
    computed: {
        display: function() {
            return 'translate(' + margin.left + ',' + margin.top + ')';
        },
        center: function() {
            return 'translate(' + (this._width() / 2) + ',' + (this._height() / 2) + ')';
        },
        displayedString: function() {
            let displayedString = this.displayedNumber.toString(),
                displayedUnits = displayedString.split(".")[0],
                decimals = displayedString.split(".")[1] || '';

            if (this.decimalPrecision > 0) {
                while (decimals.length < this.decimalPrecision) decimals += '0';
            }

            return displayedUnits + (this.decimalPrecision ? '.' + decimals : '') + this.unit;
        },
        textLength: function() {
            this.xScale.domain(this.displayedString.split('').map((d, i) => i));

            // console.log(this.xScale.domain(), this.xScale.step());

            return this.xScale.step() * this.displayedString.length;
        }
    }
}
</script>
<style lang="scss" scoped>
.big-number {
    font-size: 100px;
    font-variant-numeric: tabular-nums;
}
</style>