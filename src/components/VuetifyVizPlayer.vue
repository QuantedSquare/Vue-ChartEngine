<template>
    <v-layout align-center justify-center>
        <v-flex xs2>
            <v-btn :disabled="chartIndex == 0" flat icon @click="changeChartIndex(-1)">
                <v-icon large>navigate_before</v-icon>
            </v-btn>
        </v-flex>
        <v-flex xs8>
            <template v-for="(chart, i) in charts">
                <v-layout column align-center :key="chart.title" v-if="chartIndex == i">
                    <v-flex class="title" xs1>
                        <p>{{chart.title}}</p>
                    </v-flex>
                    <v-flex class="subheading" xs1>{{chart.subTitle}}</v-flex>
                    <v-flex :class="'chart-layout'" xs9>
                        <component :is="chart.chartType" :data="chart.data" :options="chart.options"></component>
                    </v-flex>
                    <v-flex class="caption" xs1>{{chart.techTitle}}</v-flex>
                </v-layout>
            </template>
        </v-flex>
        <v-flex xs2>
            <v-btn :disabled="chartIndex == lastIndex" flat icon @click="changeChartIndex(1)">
                <v-icon large>navigate_next</v-icon>
            </v-btn>
        </v-flex>
    </v-layout>
</template>
<script>
export default {
    name: 'VuetifyVizPlayer',
    props: {
        charts: Array
    },
    components: {},
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
<style scoped>
/*.chart-layout {
    max-width: 80vh !important;
}*/
</style>