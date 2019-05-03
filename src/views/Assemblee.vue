<template>
  <div class="chart">
    <a @click="refreshSize">Refresh Size</a>
    <ChartAssemblee :width="chartWidth"/>
  </div>
</template>
<script>
import ChartAssemblee from "@/components/ChartAssemblee.vue";

export default {
  name: "donut",
  components: {
    ChartAssemblee
  },
  data: function() {
    return {
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