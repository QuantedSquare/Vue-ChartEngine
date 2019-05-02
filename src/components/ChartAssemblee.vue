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
      </g> -->
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
  scaleLinear
} from "d3";
var TWEEN = require("@tweenjs/tween.js");

export default {
  name: "ChartAssemblee",
  props: {
    data: Object,
    width: {
      type: Number,
      default: 932
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