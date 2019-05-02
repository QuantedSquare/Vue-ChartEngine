<template>
    <div class="chart">
        <a @click="refreshSize">Refresh Size</a>
        <ChartAssemblee :data="data" :width="chartWidth" />
    </div>
</template>
<script>
import ChartAssemblee from "@/components/ChartAssemblee.vue";
import {csv} from "d3";
// import csvData from "../assets/BudgetsAN_2012-2017.csv";
// const csvData = require('@/assets/BudgetsAN_2012-2017.csv')

export default {
    name: "donut",
    components: {
        ChartAssemblee
    },
    data: function() {
        csv('BudgetsAN_2012-2017.csv').then((data) => {
            console.log("data", data)
            this.data = data
        })
        return {
            data: null,
            chartWidth: 950
        };
    },
    methods: {
        refreshSize: function() {
            this.chartWidth = 900;
        }
    }
};
</script>