<template>
  <div v-if="isLoaded" class="container">
    <v-container grid-list-xs>
    <v-layout row wrap>
      <v-flex xs9>
        <ChartDonut
          idDonut="donut1"
          :dataDonut="donutBudget"
          :width="300"
          @onClick="searchYearsData"
          :displaySunburst="smallDonut"
        />
      </v-flex>
      <v-flex xs3>Introduction</v-flex>

      <v-flex xs12>
        <ChartDonut
          idDonut="donut2"
          :dataDonut="donutBudget"
          :width="width"
          @onClick="searchYearsData"
          :displaySunburst="displaySunburst"
         />
        <Chartlines
          v-if="currentData.yearsData.length"
          :lines="currentData.yearsData"
          :width="linesW"
          :height="linesH"
          curve="curveLinear"
          scale="time"
          :title="currentData.name"
          :legends="legends"
        />
      </v-flex>
    </v-layout>
  </v-container>
  </div>
</template>
<script>
import {
  select,
  selectAll,
  scaleOrdinal,
  partition,
  hierarchy,
  format,
  arc,
  quantize,
  interpolateRainbow,
  interpolate,
  scaleLinear,
  dsv
} from "d3";
var TWEEN = require("@tweenjs/tween.js");
import ChartDonut from "@/components/ChartDonut.vue";
import Chartlines from "@/components/ChartLines";

export default {
  name: "ChartAssemblee",
  components: {
    ChartDonut,
    Chartlines
  },
  props: {
    width: {
      type: Number,
      default: 500
    }
  },
  data: function() {
    return {
      donutBudget: {
        name: "Budget",
        children: []
      },
      currentData: {
        name: null,
        yearsData: []
      },
      isLoaded: false,
      linesW: 500,
      linesH: 200,
      legends: {
        display: "frame",
        names: ["Prévisions budgetaires", "Dépenses réalisées"]
      },
      smallDonut:{
        color: {
          colorScale: Function,
          opacity: 0.6,
          childrenOpacity: {
            present: false,
            opacity: 0.6
          }
        },
        nbRing: 2,
        radiusCenter: 30,
        explanationsCenter: {
          present: false,
          width: 140,
          font: {
            size: 15,
            family: "sans-serif"
          }
        },
        slices: {
          zoomable: false,
          text: {
            present: true,
            font: {
              size: 10,
              family: "sans-serif"
            },
            rotation: "transform string"
          },
          joinSlices: true,
          supprSlices: true,
          center: {
            visibility: false
          },
          hover: true
        },
        sizes: {
          margin: 30,
          sunburstW: 300,
          legendW: 300,
          sequenceW: 300 + 300 + 30
        },
        legends: {
          present: false,
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
      },
      displaySunburst: {
        color: {
          colorScale: Function,
          opacity: 0.6,
          childrenOpacity: {
            present: false,
            opacity: 0.6
          }
        },
        nbRing: "all",
        radiusCenter: 150,
        explanationsCenter: {
          present: true,
          width: 140,
          font: {
            size: 15,
            family: "sans-serif"
          }
        },
        slices: {
          zoomable: true,
          text: {
            present: true,
            font: {
              size: 10,
              family: "sans-serif"
            },
            rotation: "transform string"
          },
          joinSlices: true,
          center: {
            visibility: false
          },
          hover: true
        },
        sizes: {
          margin: 30,
          sunburstW: this.width,
          legendW: 300,
          sequenceW: this.width + 300 + 30
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
  created: async function() {
    let extractData = null;
    let csv = dsv(";", "BudgetsAN_2012-2017.csv").then(data => {
      extractData = data;
    });
    await csv;

    let index_1 = -1;
    let index_2 = -1;

    extractData.forEach((elem, i) => {
      let code = elem[""].split("/");
      let name = elem.Libellé;
      let budget = parseInt(elem["Réalisé 2017"].replace(/\s/g, ""));
      let budgetProgess = [[], []];

      Object.keys(elem)
        .filter(key => key.search("Budget") >= 0)
        .forEach(budget => {
          budgetProgess[0].push({
            x: new Date(parseInt(budget.match(/20\d\d/)[0]), 0),
            y: parseInt(elem[budget].replace(/\s/g, "")) / 1000000
          });
        });
      Object.keys(elem)
        .filter(key => key.search("Réalisé") >= 0)
        .forEach(budget => {
          budgetProgess[1].push({
            x: new Date(parseInt(budget.match(/20\d\d/)[0]), 0),
            y: parseInt(elem[budget].replace(/\s/g, "")) / 1000000
          });
        });
      if (
        code[0].length > 2 &&
        code[0][0] !==
          "7" /*&&
        code[0].slice(0, 2) !== "64" &&
        code[0].slice(0, 2) !== "65"*/
      ) {
        if (name.match(/[A-ZÀ-ÖŒ'\.\s]/g).length === name.length) {
          ++index_2;
          if (!this.donutBudget.children[index_1].children) {
            this.donutBudget.children[index_1]["children"] = [];
          }
          this.donutBudget.children[index_1].children.push({
            name: name,
            code: code,
            budget: budget,
            budgetProgess: budgetProgess
          });
        } else if (
          budget &&
          this.donutBudget.children[index_1].children[index_2].budget !== budget
        ) {
          if (!this.donutBudget.children[index_1].children[index_2].children) {
            this.donutBudget.children[index_1].children[index_2][
              "children"
            ] = [];
          }
          this.donutBudget.children[index_1].children[index_2].children.push({
            name: name,
            code: code,
            value: budget,
            budgetProgess: budgetProgess
          });
        } else if (
          this.donutBudget.children[index_1].children[index_2].budget === budget
        ) {
          if (
            this.donutBudget.children[index_1].children[index_2].budget ===
            this.donutBudget.children[index_1].budget
          )
            this.donutBudget.children[index_1]["value"] = budget;
          else
            this.donutBudget.children[index_1].children[index_2][
              "value"
            ] = budget;
        }
      } else if (
        code[0].length === 2 &&
        code[0][0] !==
          "7" /*&&
        code[0].slice(0, 2) !== "64" &&
        code[0].slice(0, 2) !== "65"*/
      ) {
        ++index_1;
        index_2 = -1;
        if (!this.donutBudget.children) {
          this.donutBudget["children"] = [];
        }
        this.donutBudget.children.push({
          name: name,
          code: code,
          budget: budget,
          budgetProgess: budgetProgess
        });
      }
    });
    console.log("donut", this.donutBudget);

    this.isLoaded = true;
  },
  methods: {
    searchYearsData(yearsData) {
      console.log("data years", yearsData);
      this.currentData.yearsData = yearsData.data.budgetProgess
        ? yearsData.data.budgetProgess
        : [];
      this.currentData.name = yearsData.data.name ? yearsData.data.name : null;
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
text {
  font: 10px sans-serif;
}
</style>