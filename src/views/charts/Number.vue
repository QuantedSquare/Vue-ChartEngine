<template>
    <div class="chart">
        <a @click="refreshData">Refresh Number</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartNumber v-bind="chartOptions">
            <template v-slot:right="chartData">
                <text>{{chartData.displayedNumber}}</text>
            </template>
        </ChartNumber>
        <ChartNumber v-bind="chartOptions" :data="'Toto'" :textWidth="0" />
    </div>
</template>
<script>
// import { collection } from '@/modules/randomVals.js'

import ChartNumber from '@/components/Charts/ChartNumber.vue'


export default {
    name: 'lines',
    components: {
        ChartNumber
    },
    data: function() {
        return {
            chartOptions: {
                data: Math.round(Math.random() * 100) + 0.56,
                width: 720,
                height: 480,
                // initialValue: 10,
                unit: '$',
                preText: '+',
                animationTime: 2000,
                decimalPrecision: 0,
                // start: 0
                // textWidth: 0.3
            }
        }
    },
    methods: {
        refreshData: function() {
            this.chartOptions.data = Math.round(Math.random() * 1000);
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>
<style scoped>
.chart {
    width: 500px;
}
</style>