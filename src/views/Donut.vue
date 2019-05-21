<template>
  <div class="chart">
    <a @click="refreshSize">Refresh Size</a>
    <ChartDonut :dataDonut="dataDonut" :width="chartWidth" :displaySunburst="display"/>
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
      dataDonut: dataDonut,
      chartWidth: 400,
      display: {
        color: {
          colorScale: Function,
          opacity: 0.6,
          childrenOpacity: {
            present: false,
            opacity: 0.6
          }
        },
        nbRing: "all",
        slices: {
          zoomable: true,
          text: {
            present: true,
            font: {
              size: "10px",
              family: "sans-serif"
            },
            rotation: "transform string"
          },
          joinSmallestSlices: true,
          center: {
            visibility: false
          },
          hover: true
        },
        sizes: {
          margin: 30,
          sunburstW: 500,
          legendW: 300,
          sequenceW: 500 + 300 + 30
        },
        legends: {
          present: true,
          position: "right",
          clickable: true
        },
        sequence: {
          present: true,
          position: "top",
          endLabel: {
            present: true,
            unit: "Million d'euros"
          }
        }
      }
    };
  },
  methods: {
    refreshSize: function() {
      this.chartWidth = 900;
    }
  }
};
</script>
