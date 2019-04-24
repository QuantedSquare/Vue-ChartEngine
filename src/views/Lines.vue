<template>
    <div class="chart">
        <a @click="refreshLines">Refresh Lines</a> |
        <a @click="refreshSize">Refresh Size</a>
        <Chartlines :lines="randomLines" :width="chartWidth" :height="chartHeight" />
    </div>
</template>
<script>
import { lines } from '@/modules/randomVals.js'

import Chartlines from '@/components/ChartLines'


export default {
    name: 'home',
    components: {
        Chartlines
    },
    data: function() {
        return {
            randomLines: lines(),
            chartWidth: 720,
            chartHeight: 480
        }
    },
    methods: {
        refreshLines: function() {
            this.randomLines = lines();
        },
        refreshSize: function() {
            this.chartWidth = Math.round(Math.random() * 420 + 300);
            this.chartHeight = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>