import Vue from 'vue'

import ChartBars from '@/components/Charts/ChartBars.vue'
import ChartLines from '@/components/Charts/ChartLines.vue'
import ChartNumber from '@/components/Charts/ChartNumber.vue'

const Charts = {
    install: function() {
        Vue.component('chart-bars', ChartBars);
        Vue.component('chart-lines', ChartLines);
        Vue.component('chart-number', ChartNumber);
    }
}

Vue.use(Charts);