<template>
  <div class="chart">
    <ChartDonut :data="data"/>
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
      data: dataDonut
    };
  }
};
</script>