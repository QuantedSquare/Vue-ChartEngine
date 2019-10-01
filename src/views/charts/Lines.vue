<template>
    <div class="chart">
        <a @click="refreshData">Refresh Lines</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartLines :data="randomData" :width="chartWidth" :height="chartHeight" :options="chartOptions" />
    </div>
</template>
<script>
import { collection } from '@/modules/randomVals.js'

import ChartLines from '@/components/Charts/ChartLines'


export default {
    name: 'lines',
    components: {
        ChartLines
    },
    data: function() {
        let nbLines = Math.round(Math.random() * 2 + 2);
        let nbPoints = Math.round(Math.random() * 15 + 3);

        return {
            randomData: collection(nbLines, nbPoints, 0, 100),
            chartOptions: {
                curve: 'curveMonotoneX',
                // events: [{
                //     x: 3,
                //     label: 'An Event on 3'
                // }],
                isTime: false
            },
            chartWidth: 720,
            chartHeight: 480
        }
    },
    methods: {
        refreshData: function() {
            let nbLines = Math.round(Math.random() * 2 + 2);
            let nbPoints = Math.round(Math.random() * 15 + 3)

            this.chartOptions.isTime = true;
            this.randomData = collection(nbLines, nbPoints, 0, 100, true);
        },
        refreshSize: function() {
            this.chartWidth = Math.round(Math.random() * 420 + 300);
            this.chartHeight = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>