<template>
    <div class="chart">
        <a @click="refreshData">Refresh Data</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartPie v-bind="chartOptions" />
        <ChartPie v-bind="chartOptions" :cornerRadius="10" :bandWidth="10" />
    </div>
</template>
<script>
import { points } from '@/modules/randomVals.js'

import ChartPie from '@/components/Charts/ChartPie.vue'


export default {
    name: 'pie',
    components: {
        ChartPie
    },
    data: function() {
        return {
            chartOptions: {
                data: points(),
                width: 720,
                height: 480
            }
        }
    },
    methods: {
        refreshData: function() {
            this.chartOptions.data = points(Math.round(Math.random() * 15 + 3));
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>