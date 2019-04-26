<template>
    <div class="chart">
        <a @click="refreshSize">Refresh Size</a>
        <ChartDonut :data="data" :width="chartWidth" />
    </div>
</template>
<script>
import ChartDonut from "@/components/ChartDonut.vue";
import dataDonut from "../assets/donut.json";

export default {
    name: "donut",
    components: {
        ChartDonut
    },
    data: function() {
        return {
            data: dataDonut,
            chartWidth: 400
        };
    },
    methods: {
        refreshSize: function() {
            this.chartWidth = 900;
        }
    }
};
</script>