<template>
    <div class="chart">
        <a @click="refreshData">Refresh Bars</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartHorizontalBars v-bind="chartOptions" />
        <!-- <ChartHorizontalBars v-bind="chartOptions" :yAxis="false">
            <template v-slot:default="chartData">
                <line v-for="point in chartOptions.data" :x1="chartData.$data.xScale(point.x)" :x2="chartData.$data.xScale(point.x) + chartData.$data.xScale.bandwidth()" :y1="chartData.$data.yScale(point.y-10)" :y2="chartData.$data.yScale(point.y-10)" stroke="black"></line>
            </template>
        </ChartHorizontalBars> -->
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