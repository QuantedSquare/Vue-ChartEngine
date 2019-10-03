<template>
    <div class="chart">
        <a @click="refreshData">Refresh Lines</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartLines v-bind="chartOptions" />
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
            chartOptions: {
                data: collection(nbLines, nbPoints, 0, 100),
                curve: 'curveMonotoneX',
                events: [{
                    x: 3,
                    label: 'An Event on 3'
                }],
                isTime: false,
                xMin: -5,
                width: 720,
                height: 480
            }
        }
    },
    methods: {
        refreshData: function() {
            let nbLines = Math.round(Math.random() * 2 + 2);
            let nbPoints = Math.round(Math.random() * 15 + 3)

            this.chartOptions.isTime = true;
            delete this.chartOptions.xMin
            this.chartOptions.data = collection(nbLines, nbPoints, 0, 100, true);
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>