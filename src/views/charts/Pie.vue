<template>
    <div class="chart">
        <a @click="refreshData">Refresh Data</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartPie :data="randomData" :width="chartWidth" :height="chartHeight" />
    </div>
</template>
<script>
import { points } from '@/modules/randomVals.js'

import ChartPie from '@/components/Charts/ChartPie.vue'


export default {
    name: 'bars',
    components: {
        ChartPie
    },
    data: function() {
        return {
            randomData: points(),
            chartWidth: 720,
            chartHeight: 480
        }
    },
    methods: {
        refreshData: function() {
            this.randomData = points(Math.round(Math.random() * 15 + 3));
        },
        refreshSize: function() {
            this.chartWidth = Math.round(Math.random() * 420 + 300);
            this.chartHeight = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>