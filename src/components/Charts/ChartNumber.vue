<template>
    <div>
        <div>
            <!-- <span>xMax: {{xMax}}, yMax: {{yMax}}, xMin: {{xMin}}, yMin: {{yMin}}</span> -->
        </div>
    </div>
</template>
<script>
// import { select, scaleLinear, min, max, axisLeft, axisBottom } from 'd3'
// import * as shapes from 'd3-shape'

let margin = { top: 20, right: 20, bottom: 20, left: 30 };

export default {
    name: 'ChartNumber',
    props: {
        data: {
            type: Number,
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
        // console.log(this.data)

        return {}
    },
    mounted: function() {},
    watch: {

    },
    methods: {

    },
    computed: {

    }
}
</script>
<style lang="scss" scoped>
</style>