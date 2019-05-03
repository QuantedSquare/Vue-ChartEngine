<template>
<div v-if="isLoaded">
  <ChartDonut :dataDonut="donutBudget" :width="width"/>
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

export default {
  name: "ChartAssemblee",
  components: {
    ChartDonut
  },
  props: {
    width: {
      type: Number,
      default: 932
    }
  },
  data: function() {
    return {
      donutBudget: {
        name: "Budget",
        children: []
      },
      isLoaded: false
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
      let budget = parseInt(elem["Réalisé 2017"].replace(/\s/g, ""))
      // console.log(typeof(budget), budget, elem["Réalisé 2017"])
      // elem["Budget 2012 avec budget supplémentaire SAIP mai 2012"]
      console.log(code[0][0], name)
      if (code[0].length > 2 && code[0][0] !== "7" && code[0].slice(0, 2) !== "64" && code[0].slice(0, 2) !== "65") {
        if (name.match(/[A-ZÀ-ÖŒ'\.\s]/g).length === name.length) {
          ++index_2;
          if (!this.donutBudget.children[index_1].children) {
            this.donutBudget.children[index_1]["children"] = [];
          }
          this.donutBudget.children[index_1].children.push({
            name: name,
            code: code,
            budget: budget
          });
        } else if (budget && this.donutBudget.children[index_1].children[index_2].budget !== budget) {
          if (!this.donutBudget.children[index_1].children[index_2].children) {
            this.donutBudget.children[index_1].children[index_2][
              "children"
            ] = [];
          }
          this.donutBudget.children[index_1].children[index_2].children.push({
            name: name,
            code: code,
            value: budget
          });
        }
        else if (this.donutBudget.children[index_1].children[index_2].budget === budget) {
          if (this.donutBudget.children[index_1].children[index_2].budget === this.donutBudget.children[index_1].budget)
            this.donutBudget.children[index_1]["value"] = budget;
          else 
            this.donutBudget.children[index_1].children[index_2]["value"] = budget;

        }
      } else if (code[0].length === 2 && code[0][0] !== "7" && code[0].slice(0, 2) !== "64" && code[0].slice(0, 2) !== "65") {
        ++index_1;
        index_2 = -1;
        if (!this.donutBudget.children) {
          this.donutBudget["children"] = [];
        }
        this.donutBudget.children.push({
          name: name,
          code: code,
          budget: budget
        });
      }
    });
    console.log("donut", this.donutBudget);
    this.isLoaded = true
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
text {
  font: 10px sans-serif;
}
</style>