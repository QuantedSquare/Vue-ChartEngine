<template>
  <div>
    <div v-if="title">
      <span>{{title}}</span>
    </div>
    <div v-else>
      <span>xMax: {{xMax}}, yMax: {{yMax}}, xMin: {{xMin}}, yMin: {{yMin}}</span>
    </div>
    <svg :height="height" :width="width">
      <g :transform="display">
        <g id="xAxis" :transform="bottomTranslate"></g>
        <g id="yAxis">
          <text
            v-if="legends.names.length"
            transform="translate(40,-20)"
            y="6"
            dy=".71em"
            style="text-anchor: end;"
            fill="currentColor"
          >Million d'euros</text>
        </g>
        <g v-for="(line, index) in lines" class="lines" :id="`line_`+index">
          <path class="line" :d="lineDrawer(line)" :style="`stroke:`+ colorLine(index)"></path>
          <g v-for="(coords, i) in line">
            <circle
              :cx="xScale(coords.x)"
              :cy="yScale(coords.y)"
              class="point"
              :id="`point_`+i"
              r="2.5"
              :fill="colorLine(index)"
              @mouseover="hoverPoint(index, i)"
              @mouseleave="unhover(index, i)"
              stroke-width="20px"
            ></circle>
            <!-- <g class="tooltip" :id="`tooltip_`+i" display="none">
              <rect
                :x="xScale(coords.x) + 15"
                :y="yScale(coords.y) - 20"
                width="65"
                height="30"
                rx="5"
                ry="5"
                fill="white"
                :stroke="colorLine(index)"
              ></rect>
              <text :x="xScale(coords.x) + 25" :y="yScale(coords.y) - 2">{{coords.y.toFixed(2)}} {{unit}}</text>
            </g>-->
          </g>
          <text
            v-if="legends.display === `endLine`"
            :transform="legendTranslate(line)"
            x="3"
            dy=".35em"
          >{{legends.names[index]}}</text>
        </g>
        <g
          class="legend"
          :transform="frameTranslate"
          style="font-size: 20px;"
          data-style-padding="10"
          v-if="legends.display === `frame`"
        >
          <g
            class="legend_items"
            v-for="(legend, index) in legends.names"
            :id="`legend_`+index"
            :transform="serieTranslate(index)"
          >
            <text :y="index + (index-0.25)+`em`" x="1em">{{legend}}</text>
            <circle :cy="index-0.25+`em`" cx="0" r="0.2em" :style="`fill:` + colorLine(index)"></circle>
          </g>
        </g>
      </g>
      <g v-for="(line, index) in lines" class="tooltips" :id="`tooltips_`+index">
        <g v-for="(coords, i) in line" class="tooltip" :id="`tooltip_`+i" display="none">
          <rect
            :x="xScale(coords.x) + spacing(`x`,`rect`,i, line.length)"
            :y="yScale(coords.y) + spacing(`y`,`rect`,i, line.length)"
            width="65"
            height="30"
            rx="5"
            ry="5"
            fill="white"
            :stroke="colorLine(index)"
          ></rect>
          <text
            :x="xScale(coords.x) + spacing(`x`,`text`,i, line.length)"
            :y="yScale(coords.y) + spacing(`y`,`text`,i, line.length)"
          >{{coords.y.toFixed(2)}} {{unit}}</text>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
import {
  select,
  scaleLinear,
  min,
  max,
  axisLeft,
  axisBottom,
  scaleTime,
  schemeCategory10,
  scaleOrdinal,
  interpolateRgb,
  quantize
} from "d3";
import * as shapes from "d3-shape";

let margin = { top: 20, right: 20, bottom: 20, left: 30 };

// city
//   .append("text")
//   .datum(function(d) {
//     return { name: d.name, value: d.values[d.values.length - 1] };
//   })
//   .attr("transform", function(d) {
//     return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
//   })
//   .attr("x", 3)
//   .attr("dy", ".35em")
//   .text(function(d) {
//     return d.name;
//   });

export default {
  name: "ChartLines",
  props: {
    lines: {
      type: Array,
      required: true
    },
    height: {
      type: Number,
      default: 480
    },
    width: {
      type: Number,
      default: 720
    },
    curve: {
      type: String,
      default: "curveBasis"
    },
    scale: {
      type: String,
      default: "linear"
    },
    title: {
      type: String,
      default: null
    },
    legends: {
      type: Object,
      default: {}
    },
    unit: {
      type: String,
      default: null
    }
  },
  data: function() {
    // console.log("lines", this.lines);

    // let colorScale = scaleOrdinal(schemeCategory10);
    let interpolator = interpolateRgb(
      "rgba(255, 18, 120, 1)",
      "rgba(12, 204, 249, 1)"
    );
    let colorScale = scaleOrdinal(quantize(interpolator, 2));

    let xScale = this.scale === "linear" ? scaleLinear() : scaleTime(),
      yScale = scaleLinear();

    let lineDrawer = shapes
      .line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(shapes[this.curve]);

    xScale.range([0, this._width()]);
    xScale.domain([this.getMin("x"), this.getMax("x")]);

    yScale.range([this._height(), 0]);
    yScale.domain([this.getMin("y"), this.getMax("y")]);

    return {
      xScale: xScale,
      yScale: yScale,
      lineDrawer: lineDrawer,
      colorLine: colorScale
    };
  },
  mounted: function() {
    this.drawXAxis();
    this.drawYAxis();
  },
  watch: {
    width: function() {
      this.xScale.range([0, this._width()]);
      this.drawXAxis();
    },
    height: function() {
      this.yScale.range([this._height(), 0]);
      this.drawYAxis();
    },
    xMax: function() {
      this.xScale.domain([this.getMin("x"), this.getMax("x")]);
      this.drawXAxis();
    },
    yMax: function() {
      this.yScale.domain([this.getMin("y"), this.getMax("y")]);
      this.drawYAxis();
    },
    xMin: function() {
      this.xScale.domain([this.getMin("x"), this.getMax("x")]);
      this.drawXAxis();
    },
    yMin: function() {
      this.yScale.domain([this.getMin("y"), this.getMax("y")]);
      this.drawYAxis();
    },
    curve: function() {
      this.lineDrawer.curve(shapes[this.curve]);
    }
  },
  methods: {
    spacing: function(coord, div, i, len) {
        if (div === "rect") {
          if (coord === "y") return i !== len - 1 ? 2 : 4;
          if (coord === "x") return i !== len - 1 ? 45 : -50;
        }
        if (div === "text") {
          if (coord === "y") return i !== len - 1 ? 20 : 22;
          if (coord === "x") return i !== len - 1 ? 55 : -40;
        }
    },
    hoverPoint: function(lineI, pointI, line) {
      let point = select("#line_" + lineI + " #point_" + pointI);
      point.classed("hover", true);

      let tooltip = select("#tooltips_" + lineI + " #tooltip_" + pointI);
      tooltip.attr("display", null);
      tooltip.raise();
    },
    unhover: function(lineI, pointI) {
      let point = select("#line_" + lineI + " #point_" + pointI);
      point.classed("hover", false);

      let tooltip = select("#tooltips_" + lineI + " #tooltip_" + pointI);
      tooltip.attr("display", "none");
    },
    drawXAxis: function() {
      select("#xAxis").call(axisBottom(this.xScale));
    },
    drawYAxis: function() {
      select("#yAxis").call(axisLeft(this.yScale));
    },
    _width: function() {
      return this.legends.present && this.legends.position === "end"
        ? this.width - margin.left - margin.right - this.legends.width
        : this.width - margin.left - margin.right;
    },
    _height: function() {
      return this.height - margin.top - margin.bottom;
    },
    getMax: function(axis) {
      return max(
        this.lines.map(line => {
          return max(line, d => d[axis]);
        })
      );
    },
    getMin: function(axis) {
      return min(
        this.lines.map(line => {
          return min(line, d => d[axis]);
        })
      );
    },
    legendTranslate: function(line) {
      let xT = line[line.length - 1].x;
      let yT = line[line.length - 1].y;
      return `translate(${this.xScale(xT)}, ${this.yScale(yT)})`;
    },
    serieTranslate: function(index) {
      let len = [];
      select(".legend")
        .selectAll("text")
        .each(function(d) {
          // console.log(this.getComputedTextLength())
          len.push(this.getComputedTextLength());
        });
      return this.legends.present && this.legends.position === "top"
        ? "translate(" + len[index] * (index * -1.3) + "," + index * -20 + ")"
        : null;
    }
  },
  computed: {
    display: function() {
      return "translate(" + margin.left + "," + margin.top + ")";
    },
    bottomTranslate: function() {
      return "translate(0," + this._height() + ")";
    },
    frameTranslate: function() {
      let posLegend =
        this.legends.present && this.legends.position === "end"
          ? 0
          : this.legends.width + margin.right + 10;
      return "translate(" + (this._width() - posLegend + margin.right) + ",0)";
    },
    xMax: function() {
      return this.getMax("x");
    },
    yMax: function() {
      return this.getMax("y");
    },
    xMin: function() {
      return this.getMin("x");
    },
    yMin: function() {
      return this.getMin("y");
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.line {
  fill: none;
  stroke: steelblue;
  stroke-width: 1.5px;
}

.lines .point {
  position: relative;
  transition: r 250ms linear;
  -moz-transition: r 250ms linear;
  -webkit-transition: r 250ms linear;
}

.lines .point.hover {
  r: 10;
  opacity: 0.5;
}

.nvtooltip {
  position: absolute;
  background-color: rgba(255, 255, 255, 1);
  padding: 10px;
  border: 1px solid #ddd;

  font-family: Arial;
  font-size: 13px;

  transition: opacity 500ms linear;
  -moz-transition: opacity 500ms linear;
  -webkit-transition: opacity 500ms linear;

  transition-delay: 500ms;
  -moz-transition-delay: 500ms;
  -webkit-transition-delay: 500ms;

  -moz-box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.5);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.5);

  -moz-border-radius: 15px;
  border-radius: 15px;
}
</style>