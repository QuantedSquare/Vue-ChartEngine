<template>
    <div class="chart">
        <a @click="refreshData">Refresh Points</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartPointCloud v-bind="chartOptions" :pointsLabels="true" :coloredLabels="true" :xAxis="false" />
        <ChartPointCloud v-bind="chartOptions" :yAxis="false">
            <template v-slot:top="chartData">
                <line v-for="x in nbPoints" :x1="chartData.$data.xScale(x-1)" :x2="chartData.$data.xScale(x-1)" :y1="chartData.$data.yScale(chartData._yMin)" :y2="chartData.$data.yScale(chartData._yMax)" stroke="black"></line>
            </template>
        </ChartPointCloud>
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
            chartOptions: {
                data: collection(1, nbPoints, 0, 100),
                yMin: 0,
                // xMin: -2,
                xLines: true,
                xLabel: point => point.x / 2,
                yLabel: point => point.y,
                labelAnchor: 'middle',
                height: 480,
                width: 720
            },
            nbPoints: nbPoints
        }
    },
    methods: {
        refreshData: function() {
            let nbCollections = Math.round(Math.random() * 2 + 2);
            let nbPoints = Math.round(Math.random() * 15 + 3)

            this.chartOptions.data = collection(nbCollections, nbPoints, 0, 100);
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>