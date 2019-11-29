<template>
    <div class="chart">
        <a @click="refreshData">Refresh Bars</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartHorizontalBars v-bind="chartOptions" :barsPadding="10" />
        <ChartHorizontalBars v-bind="chartOptions" :yAxis="false" :bandHeight="20" :cornerRadius="10" :barsPadding="2">
            <template v-slot:default="chartData">
            </template>
        </ChartHorizontalBars>
    </div>
</template>
<script>
import { collection } from '@/modules/randomVals.js'
import { aggregatePoints } from '@/modules/utilities.js'

import ChartHorizontalBars from '@/components/Charts/ChartHorizontalBars.vue'

export default {
    name: 'bars',
    components: {
        ChartHorizontalBars
    },
    data: function() {
        let nbLines = Math.round(Math.random() * 2 + 2);
        let nbPoints = Math.round(Math.random() * 2 + 3);

        return {
            chartOptions: {
                data: collection(nbLines, nbPoints, 0, 100),
                animationTime: 1000,
                min: 0,
                width: 720,
                height: 480
            }
        }
    },
    methods: {
        refreshData: function(min, max) {
            let nbLines = Math.round(Math.random() * 4 + 2);
            let nbPoints = Math.round(Math.random() * 2 + 3);

            this.chartOptions.data = collection(nbLines, nbPoints, 0, 100);
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>