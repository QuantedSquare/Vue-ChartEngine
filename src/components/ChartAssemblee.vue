<template>
  <div>
    <svg height="1000" width="100%">
      <!-- <g fill-opacity="0.6" transform="translate(500, 500)">
        <path
          v-for="(slice, index) in slices"
          :key="slice.id"
          :fill="colorScale(slice.parentName)"
          :id="`slice`+index"
          :d="arcSlice(slice)"
          style="cursor: pointer;"
          @click="clicked(index)"
        ></path>
      </g>
      <g pointer-events="none" text-anchor="middle" transform="translate(500, 500)">
        <text
          v-for="(text, index) in texts"
          :id="`text`+index"
          :transform="text.transform"
          dy="0.35em"
        >{{text.display ? text.name : null}}</text>
      </g>-->
    </svg>
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

export default {
  name: "ChartAssemblee",
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
      // elem["Budget 2012 avec budget supplémentaire SAIP mai 2012"]
      console.log(code[0]);
      if (code[0].length > 2) {
        if (name.match(/[A-ZÀ-ÖŒ'\.\s]/g).length === name.length) {
          console.log("name", name);
          ++index_2;
          if (!this.donutBudget.children[index_1].children) {
            this.donutBudget.children[index_1]["children"] = [];
          }
          this.donutBudget.children[index_1].children.push({
            name: name,
            code: code,
            children: []
          });
        } else {
          console.log(index_1, index_2, this.donutBudget.children[index_1])
          if (!this.donutBudget.children[index_1].children[index_2].children) {
            console.log("je passe la")
            this.donutBudget.children[index_1].children[index_2]["children"] = [];
          }
          this.donutBudget.children[index_1].children[index_2].children.push({
            name: name,
            code: code,
            value: elem["Réalisé 2017"]
          });
        }
      } else if (code[0].length === 2) {
        ++index_1;
        index_2 = -1;
        if (!this.donutBudget.children) {
          this.donutBudget["children"] = [];
        }
        this.donutBudget.children.push({
          name: name,
          code: code,
          children: []
        });
      }
    });
    console.log(this.donutBudget);
    // console.log(Object.values(this.dataBudget[0]))
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
text {
  font: 10px sans-serif;
}
</style>