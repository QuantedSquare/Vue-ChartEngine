<template>
    <div class="chart">
        <a @click="refreshData">Refresh Points</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartPointCloud :data="randomData" :width="chartWidth" :height="chartHeight" :options="chartOptions" />
    </div>
</template>
<script>
import { collection } from '@/modules/randomVals.js'

import ChartPointCloud from '@/components/Charts/ChartPointCloud'


export default {
    name: 'lines',
    components: {
        ChartPointCloud
    },
    data: function() {
        let nbCollections = Math.round(Math.random() * 2 + 2);
        let nbPoints = Math.round(Math.random() * 15 + 3);

        return {
            randomData: collection(nbCollections, nbPoints, 0, 100),
            chartOptions: {},
            chartWidth: 720,
            chartHeight: 480
        }
    },
    methods: {
        refreshData: function() {
            let nbCollections = Math.round(Math.random() * 2 + 2);
            let nbPoints = Math.round(Math.random() * 15 + 3)

            this.randomData = collection(nbCollections, nbPoints, 0, 100);
        },
        refreshSize: function() {
            this.chartWidth = Math.round(Math.random() * 420 + 300);
            this.chartHeight = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>