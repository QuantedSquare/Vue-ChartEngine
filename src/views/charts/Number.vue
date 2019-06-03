<template>
    <div class="chart">
        <a @click="refreshData">Refresh Number</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartNumber :data="randomData" :width="chartWidth" :height="chartHeight" curve="curveMonotoneX" />
    </div>
</template>
<script>
// import { collection } from '@/modules/randomVals.js'

import ChartNumber from '@/components/Charts/ChartNumber.vue'


export default {
    name: 'lines',
    components: {
        Chartlines
    },
    data: function() {
        return {
            randomData: Math.round(Math.random() * 500),
            chartWidth: 720,
            chartHeight: 480
        }
    },
    methods: {
        refreshData: function() {
            this.randomData = Math.round(Math.random() * 500);
        },
        refreshSize: function() {
            this.chartWidth = Math.round(Math.random() * 420 + 300);
            this.chartHeight = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>