<template>
    <v-layout align-center>
        <v-flex xs1>
            <v-btn :disabled="chartIndex == 0" flat icon large @click="changeChartIndex(-1)">
                <v-icon large>navigate_before</v-icon>
            </v-btn>
        </v-flex>
        <v-flex xs10>
            <template v-for="(chart, i) in charts">
                <v-layout wrap :key="chart.title" v-if="chartIndex == i">
                    <v-flex xs12>{{chart.title}}</v-flex>
                    <v-flex xs12>
                        <component :is="chart.chartType" :data="chart.data"></component>
                    </v-flex>
                </v-layout>
            </template>
        </v-flex>
        <v-flex xs1>
            <v-btn :disabled="chartIndex == lastIndex" flat icon large @click="changeChartIndex(1)">
                <v-icon large>navigate_next</v-icon>
            </v-btn>
        </v-flex>
    </v-layout>
</template>
<script>
import ChartBars from '@/components/ChartBars.vue'
import ChartLines from '@/components/ChartLines.vue'

export default {
    name: 'VuetifyVizPlayer',
    props: {
        charts: Array
    },
    components: {
        ChartBars,
        ChartLines
    },
    data: function() {
        return {
            chartIndex: 0,
            lastIndex: this.charts.length - 1
        }
    },
    methods: {
        changeChartIndex: function(indexModifier) {
            let newIndex = this.chartIndex + indexModifier;

            // Useless if buttons disabled.
            if (newIndex < 0) newIndex = 0;
            if (newIndex > this.lastIndex) newIndex = this.lastIndex;

            this.chartIndex = newIndex;
        }
    }
}
</script>
<style lang="scss">
</style>