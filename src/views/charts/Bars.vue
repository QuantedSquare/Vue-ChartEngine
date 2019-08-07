<template>
    <div class="chart">
        <a @click="refreshData">Refresh Bars</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartBars :data="randomData" :width="chartWidth" :height="chartHeight" :options="chartOptions" />
    </div>
</template>
<script>
import { points } from '@/modules/randomVals.js'
import { aggregatePoints } from '@/modules/utilities.js'

import ChartBars from '@/components/Charts/ChartBars.vue'


export default {
    name: 'bars',
    components: {
        ChartBars
    },
    data: function() {
        return {
            randomData: this.refreshData(),
            chartWidth: 720,
            chartHeight: 480,
            chartOptions: {
                animationTime: 1000,
                min: 0
            }
        }
    },
    methods: {
        refreshData: function() {
            let newData = points(3, 100, 150);

            let smallPoints = points(Math.round(Math.random() * 15 + 3), 1, 10);

            smallPoints.forEach(point => point.x += 3);

            newData.push(...smallPoints);

            this.randomData = aggregatePoints(newData, 0.2, 'x');

            return newData;
        },
        refreshSize: function() {
            this.chartWidth = Math.round(Math.random() * 420 + 300);
            this.chartHeight = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>