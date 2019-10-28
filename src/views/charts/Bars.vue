<template>
    <div class="chart">
        <a @click="refreshData(10000, 15000)">Refresh Bars</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartBars v-bind="chartOptions" />
        <ChartBars v-bind="chartOptions" />
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
            chartOptions: {
                data: this.refreshData(100, 150),
                animationTime: 1000,
                min: 0,
                width: 720,
                height: 480
            }
        }
    },
    methods: {
        refreshData: function(min, max) {

            let newData = points(3, min, max);

            let smallPoints = points(Math.round(Math.random() * 15 + 3), 1, 10);

            smallPoints.forEach(point => point.x += 3);

            newData.push(...smallPoints);

            // console.log(this.chartOptions);

            if (this.chartOptions) this.chartOptions.data = aggregatePoints(newData, 0.2, 'x');

            return newData;
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>