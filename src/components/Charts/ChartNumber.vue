<template>
    <svg :viewBox="'0 0 ' + width + ' ' + height">
        <g :transform="display">
            <text class="big-number" text-anchor="middle" :textLength="textLength" :transform="center">{{displayedNumber}}{{options.unit}}</text>
        </g>
    </svg>
</template>
<script>
import { interpolateNumber } from 'd3'
// import * as shapes from 'd3-shape'

let margin = { top: 0, right: 0, bottom: 0, left: 0 };

export default {
    name: 'ChartNumber',
    props: {
        data: {
            type: Number,
            required: true
        },
        options: {
            type: Object,
            default: function() {
                return {
                    start: 0,
                    animationTime: 2000,
                    unit: ''
                }
            }
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
        // console.log(this.data, this.options);
        let start = this.options.start || 0;

        return {
            interpolatedNumber: interpolateNumber(start, this.data),
            displayedNumber: start,
            startAnimation: Date.now()
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

            this.displayedNumber = Math.round(animatedNumber);

            if (this.animationState() < 1) setTimeout(this.animate, 0);
        },
        animationState: function() {
            if ((this.startAnimation + this.options.animationTime) > Date.now()) {
                return (Date.now() - this.startAnimation) / this.options.animationTime;
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
        textLength: function() {
            let nbLength = this.displayedNumber.toString().length;

            if (this.options.unit) nbLength += this.options.unit.length;

            if (nbLength < 3) return this._width() / 4;
            if (nbLength <= 4) return this._width() / 3;
            return this._width() / 2;
        }
    }
}
</script>
<style lang="scss" scoped>
.big-number {
    font-size: 100px;
}
</style>