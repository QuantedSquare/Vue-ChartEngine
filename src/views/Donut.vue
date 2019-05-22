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
        radiusCenter: 100,
        slices: {
          zoomable: true,
          text: {
            present: false,
            font: {
              size: 10,
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
          font: {
            size: 10,
            family: "sans-serif"
          },
          position: "top",
          endLabel: {
            font: {
              size: 12,
              family: "sans-serif",
              weight: "bold"
            },
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
