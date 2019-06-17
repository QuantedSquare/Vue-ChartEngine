<template>
  <v-container fluid fill-height v-if="isLoaded" class="pa-0">
    <v-layout wrap justify-center>
      <v-flex xs12>
        <v-card class="pa-3 elevation-0 back">
          <v-container>
            <v-layout wrap align-end>
              <v-flex xs12 sm4 xl3>
                <ChartDonut
                  idDonut="donut1"
                  :dataDonut="donutBudget"
                  @onClick="searchYearsData"
                  :displaySunburst="smallDonut"
                  v-model="linesData"
                  :formatTxt="formatTxt"
                />
              </v-flex>
              <v-flex xs12 sm8 xl9 class="text-xs-left pl-3">
                <span id="title">
                  Dépenses de
                  <br>l'Assemblée
                </span>
                <p class="textPara intro">
                  <br>En 2017 l'assemblée nationale a dépensé au total
                  <span
                    class="firstLetter"
                    style="color: rgb(255, 0, 111)"
                  >576,29 M€</span>
                  <br>
                  <b>Comment sont-elles réparties ?</b>
                </p>
                <p class="textPara">
                  <span style="color: rgb(227, 12, 149)">
                    <span class="firstLetter">57%</span> en
                    <b>Charges parlementaires</b>
                  </span>
                  <!-- <br>blabla -->
                </p>
                <p class="textPara">
                  <span style="color: rgb(200, 7, 178)">
                    <span class="firstLetter">30%</span> en
                    <b>Charges de personnel</b>
                  </span>
                  <!-- <br>blabla -->
                </p>
                <p class="textPara">
                  <span style="color: rgb(172, 1, 207)">
                    <span class="firstLetter">13%</span> pour
                    <b>d'autres charges</b>
                  </span>
                  <!-- <br>blabla -->
                </p>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
      <v-flex xs12 mt-4 v-resize="onResize2">
        <v-layout wrap align-center justify-center :class="padding">
          <v-flex
            v-if="currentData.yearsData.length"
            xs12
            lg5
            mb-4
            id="chartLines"
            v-resize="onResize"
          >
            <Chartlines
              :lines="currentData.yearsData"
              :width="linesW"
              :height="linesH"
              curve="curveLinear"
              scale="time"
              :title="currentData.name"
              :legends="legends"
              :unit="displaySunburst.sequence.endLabel.unit"
              v-model="linesData"
            />
          </v-flex>
          <v-flex :class="currentData.yearsData.length ?`md12 lg7 mb-4` : `sm12 lg9 mb-4`">
            <ChartDonut
              idDonut="donut2"
              :dataDonut="donutBudget"
              @onClick="searchYearsData"
              :displaySunburst="displaySunburst"
              :formatTxt="formatTxt"
            />
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
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
import { maxHeaderSize } from "http";

export default {
  name: "ChartAssemblee",
  components: {
    ChartDonut,
    Chartlines
  },
  data: function() {
    return {
      formatTxt: /*"upCase",*/ "ucFirst",
      linesData: {
        name: null,
        yearsData: []
      },
      donutBudget: {
        name: "Budget",
        children: []
      },
      currentData: {
        name: null,
        yearsData: []
      },
      isLoaded: false,
      padding: this.setPadding(),
      linesW: 500,
      linesH: 200,
      legends: {
        present: true,
        position: "top",
        display: "frame",
        names: ["Prévisions budgetaires", "Dépenses réalisées"],
        width: 115
      },
      smallDonut: {
        targetIndex: 0,
        color: {
          colorScale: "interpolateRgb",
          colorMin: "rgba(255, 18, 120, 1)",
          colorMax: "rgba(172, 1, 207, 1)",
          opacity: 1,
          childrenOpacity: {
            present: false,
            opacity: 0.4
          }
        },
        nbRing: 2,
        radiusCenter: 30,
        explanationsCenter: {
          present: false,
          width: 140,
          font: {
            size: 15,
            family: "Poppins"
          }
        },
        slices: {
          zoomable: true,
          text: {
            present: true,
            font: {
              size: 11,
              family: "Poppins"
            },
            rotation: "transform string"
          },
          joinSlices: { present: true, bornInclusion: [0, 29720540] },
          supprSlices: {
            present: true,
            keepData: null,
            bornExclusion: [0, 400000000],
            into: true
          },
          center: {
            visibility: false
          },
          hover: true
        },
        sizes: {
          maxW: 300,
          center: 30,
          sunburstW: 300,
          legendW: 300,
          sequenceW: 600,
          offset: "offset-xs0 offset-sm2 offset-md4"
        },
        legends: {
          present: false,
          position: "right",
          clickable: true
        },
        sequence: {
          present: true,
          font: {
            size: 11,
            family: "Poppins"
          },
          position: "top",
          center: true,
          endLabel: {
            font: {
              size: 12,
              family: "Poppins",
              weight: "bold"
            },
            present: true,
            unit: "M€"
          }
        }
      },
      displaySunburst: {
        targetIndex: 0,
        color: {
          colorScale: "interpolateRgb",
          colorMin: "rgba(12, 204, 249, 1)",
          colorMax: "rgba(162, 255, 174, 1)",
          opacity: 0.6,
          childrenOpacity: {
            present: true,
            opacity: 0.4
          }
        },
        nbRing: "all",
        radiusCenter: 150,
        explanationsCenter: {
          present: true,
          width: 140,
          font: {
            size: 15,
            family: "Poppins"
          }
        },
        slices: {
          zoomable: true,
          text: {
            present: false,
            font: {
              size: 11,
              family: "Poppins"
            },
            rotation: "transform string"
          },
          joinSlices: { present: false, bornInclusion: [0, 29720540] },
          supprSlices: {
            present: true,
            keepData: null,
            bornExclusion: [0, 29720540],
            into: false
          },
          center: {
            visibility: false
          },
          hover: true
        },
        sizes: {
          maxW: 500,
          center: 150,
          sunburstW: 500,
          legendW: this.setLegendW(),
          sequenceW: this.setSeqW(),
          offset: ""
        },
        legends: {
          present: true,
          position: "right",
          clickable: true
        },
        sequence: {
          present: true,
          font: {
            size: 11,
            family: "Poppins"
          },
          position: "top",
          center: false,
          endLabel: {
            font: {
              size: 12,
              family: "Poppins",
              weight: "bold"
            },
            present: true,
            unit: "M€"
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
            y:
              parseInt(
                elem[budget].length ? elem[budget].replace(/\s/g, "") : 0
              ) / 1000000
          });
        });
      Object.keys(elem)
        .filter(key => key.search("Réalisé") >= 0)
        .forEach(budget => {
          // console.log("elem budget",elem[budget], )
          budgetProgess[1].push({
            x: new Date(parseInt(budget.match(/20\d\d/)[0]), 0),
            y:
              parseInt(
                elem[budget].length ? elem[budget].replace(/\s/g, "") : 0
              ) / 1000000
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
            name: this.formatTxt === "upCase" ? name.toUpperCase() : this.Ucfirst(name),
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
            name: this.formatTxt === "upCase" ? name.toUpperCase() : this.Ucfirst(name),
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
          name: this.formatTxt === "upCase" ? name.toUpperCase() : this.Ucfirst(name),
          code: code,
          budget: budget,
          budgetProgess: budgetProgess
        });
      }
    });
    // console.log("donut", this.donutBudget);

    this.isLoaded = true;
  },
  watch: {
    linesData: function(newLines) {
      this.currentData.name = newLines.name;
      this.currentData.yearsData = newLines.budgetProgess;
    }
  },
  methods: {
    Ucfirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },
    setSeqW() {
      let screenW = window.innerWidth,
        px5 = 48,
        px1 = 4,
        lg = 7,
        md = 12;

      let flexW = null;
      if (screenW > 1264) flexW = ((screenW - px5 * 2) / 12) * 7;
      else if (screenW > 996) flexW = 900;
      else if (screenW > 600) flexW = screenW - px5 * 2;
      else flexW = screenW - px1 * 2;
      return flexW;
    },
    setLegendW() {
      let screenW = window.innerWidth,
        pl3 = 16;

      let flexW = this.setSeqW();
      let sidebarW = null;
      if (screenW > 600) sidebarW = (flexW / 12) * 4 - pl3;
      else sidebarW = (flexW / 12) * 10 - pl3;

      console.log("sidebarW", sidebarW, flexW)
      return sidebarW;
    },
    setPadding() {
      if (window.innerWidth < 600) return "px-1";
      else return "px-5";
    },
    onResize2() {
      this.padding = this.setPadding();
    },
    onResize() {
      let lines = document.getElementById("chartLines");
      if (lines.offsetWidth < 375) this.linesW = 372;
      else this.linesW = lines.offsetWidth;
    },
    searchYearsData(yearsData, idDonut, index) {
      // console.log("data years", yearsData, idDonut);
      if (idDonut === "donut1") {
        let n = this.formatTxt === "upCase"? "AUTRES CHARGES" : "Autres charges"
        this.displaySunburst.slices.supprSlices.keepData =
          yearsData.data.name === n ? null : yearsData.data.name;
        this.displaySunburst.targetIndex = 0;
      } else this.displaySunburst.targetIndex = index;
      this.currentData.yearsData = yearsData.data.budgetProgess
        ? yearsData.data.budgetProgess
        : [];
      this.currentData.name = yearsData.data.name ? yearsData.data.name : null;
      // console.log("dataBudget", this.donutBudget.children[8].budget)
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
text {
  font: 10px "Poppins";
}

.intro {
  font-size: 15px;
}

.textPara {
  line-height: 20px;
  margin-top: 10px;
}

.firstLetter {
  font-size: 20px;
  font-weight: bolder;
}

.back {
  /* background: linear-gradient(10deg, rgba(15, 17, 32, 1), rgba(15, 17, 32, 1)); */
  background: linear-gradient(10deg, rgb(162, 255, 174), rgb(12, 205, 249));
  /* background: linear-gradient(45deg, rgb(136, 0, 163), rgb(255, 0, 111)); */
}

#title {
  font-size: calc(40px + (80 - 40) * ((100vw - 300px) / (1600 - 300)));
  /* font-size: 20px; */
  font-weight: bold;
  /* font-family: sans-serif;  */
  line-height: 1.125;
}
</style>