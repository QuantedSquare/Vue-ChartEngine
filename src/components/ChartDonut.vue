<template>
    <div>
        <svg height="1000" width="100%">
            <!-- <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <rect class="bar" v-for="point in bars" :x="xScale(point.x)" :y="_height() - yScale(point.y)" :width="xScale.bandwidth()" :height="yScale(point.y)"></rect>
            </g> -->
            <g fill-opacity="0.6" transform="translate(500, 500)">
                <path v-for="slice in donut.slice" :fill="slice.fill" :d="slice.d" style="cursor: pointer;"></path>
            </g>
            <g pointer-events="none" text-anchor="middle" transform="translate(500, 500)">
                <text v-for="text in donut.text" :transform="text.transform" dy="0.35em">{{text.display ? text.name : null}}</text>
            </g>
        </svg>
    </div>
</template>
<script>
// import { select, scaleLinear, scaleBand, min, max, axisLeft, axisBottom } from 'd3'

import {
  select,
  scaleOrdinal,
  partition,
  hierarchy,
  format,
  arc,
  quantize,
  interpolateRainbow
} from "d3";

export default {
    name: 'ChartDonut',
    props: {
        data: Object
    },
    data: function() {
    return {
      donut: {}
    };
  },
  created() {
    console.log(this.data);

    let width = 932;

    let radius = width / 2;

    var parti = partition()
      .size([2 * Math.PI, radius]);

    var root = hierarchy(this.data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    parti(root);

    var color = scaleOrdinal(
      quantize(interpolateRainbow, this.data.children.length + 1)
    );

    var form = format(",d");

    var arcSlice = arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - 1);

    this.donut.slice = root.descendants().map(d => {
      let coord = arcSlice(d);
      while (d.depth > 1) d = d.parent;
      let fill = color(d.data.name);
      return {
        fill: fill,
        d: coord
      };
    });

    this.donut.text = root.descendants().map(d => {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      let display = (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10
      let transform = `rotate(${x - 90}) translate(${y},0) rotate(${
        x < 180 ? 0 : 180
      })`;
      let name = d.data.name;
      return {
        display: display,
        name: name,
        transform: transform
      };
    });
  }

}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
text {
   font: 10px sans-serif
}
</style>

