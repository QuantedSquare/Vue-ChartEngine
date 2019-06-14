<template>
  <v-container pa-0 fill-height :class="idDonut">
    <v-layout wrap align-center justify-center id="donutChart">
      <v-flex xs12 class="width_text" :style="fontSlices+`;color: transparent;`">
        <span id="maj">ACHATS DE CONTRACTUEL</span>
        <span id="min">achats de contractuel</span>
        <span id="mix">Achats de contractuel</span>
        <span id="label" :style="fontEndLabel">14.52 {{displaySunburst.sequence.endLabel.unit}}</span>
      </v-flex>
      <v-flex xs12 id="sequence" v-if="displaySunburst.sequence.present" v-resize="onResize">
        <svg width="100%" height="80" id="trail">
          <text
            v-if="sequences.seqNames.length > 0 && notCenter(sequences.seqNames) && displaySunburst.sequence.endLabel.present"
            id="endlabel"
            :x="translatePolygon[translatePolygon.length - 1] + 15"
            :y="ySpan(span, sequences.seqNames)"
            dy="0.35em"
            text-anchor="start"
            fill="rgb(0, 0, 0);"
            :style="fontEndLabel"
          >{{sequences.labelBudget}} {{displaySunburst.sequence.endLabel.unit}}</text>
          <g
            v-if="notCenter(sequences.seqNames)"
            v-for="(sequence, index) in sequences.seqNames"
            :transform="`translate(`+ translatePolygon[index] +`, 0)`"
          >
            <polygon
              :points="polygonPoints(sequence, sequences.seqNames)"
              :fill="colorScale(sequences.colorName)"
              :fill-opacity="displaySunburst.color.opacity"
            ></polygon>
            <text :id="`text_`+index" text-anchor="middle" :style="fontSeq">
              <tspan
                v-for="(name, index) in sequence"
                :x="((Math.max(...sequence.map(span => span.length)) * majW + 10) / 2)+10"
                :y="ySpan(sequence, sequences.seqNames)"
                :dy="sequence.length > 1 ? (index * 1.1) + `em` : `0.35em`"
              >{{name}}</tspan>
            </text>
          </g>
        </svg>
      </v-flex>
      <v-flex :class="chartPos" id="chart" style="position: relative">
        <!-- <div> -->
        <div
          id="explanation"
          :style="fontExplanations + explanationsPos"
          v-if="displaySunburst.explanationsCenter.present"
          @click="!displaySunburst.slices.zoomable ? null : clicked(currentPathCenter, idDonut)"
        >
          {{sequences.currentHover ? sequences.currentHover : transformData.name}}
          <br>
          <br>
          <span id="labelBugdet">{{displayBudget}} {{displaySunburst.sequence.endLabel.unit}}</span>
        </div>
        <svg
          :height="displaySunburst.sizes.sunburstW"
          :width="displaySunburst.sizes.sunburstW"
          @mouseleave="mouseleave"
        >
          <g fill-opacity="0.6" :transform="translateChart">
            <path
              v-for="(slice, index) in slices"
              :key="slice.id"
              :fill="colorScale(slice.parentName)"
              :fill-opacity="visibleArc(index, slice)"
              :id="`slice`+index"
              :d="arcSlice(slice)"
              :style="!displaySunburst.slices.zoomable ? null : idDonut === `donut1` && index === 0 ? null : `cursor: pointer;`"
              @click="!displaySunburst.slices.zoomable ? null : idDonut === `donut1` && index === 0 ? null : clicked(index, idDonut)"
              @mouseover="mLeave === 0 ? null : mouseover(index)"
            ></path>
          </g>
          <g
            v-if="displaySunburst.slices.text.present"
            pointer-events="none"
            text-anchor="middle"
            :transform="translateChart"
          >
            <text
              v-for="(text, index) in texts"
              :id="`text`+index"
              :transform="text.transform"
              dy="0.35em"
              :style="fontSlices"
            >
              <tspan
                v-for="(name, index) in text.name"
                :x="0"
                :y="0"
                :dy="text.name.length > 1 ? (-0.50 + index) + `em` : `0.35em`"
              >{{text.display ? name : null}}</tspan>
            </text>
          </g>
        </svg>
      </v-flex>
      <v-flex xs10 sm4 pl-3 id="sidebar" v-if="displaySunburst.legends.present">
        <b>Legend</b>
        <br>
        <div id="legend">
          <svg :width="displaySunburst.sizes.legendW" :height="legends.nbSpan * 33">
            <g
              v-for="(legend, index) in legends.arrayNames"
              :transform="translateLegend(legends.arrayNames, index, legend)"
              @click="!displaySunburst.legends.clickable ? null : clicked(index + 1, idDonut)"
              :style="!displaySunburst.legends.clickable ? null : `cursor: pointer;`"
            >
              <rect
                rx="3"
                ry="3"
                width="18"
                height="18"
                :fill="colorScale(legends.names[index])"
                :fill-opacity="displaySunburst.color.opacity"
              ></rect>
              <text
                v-for="(partName, i) in legend"
                x="22"
                :y="9 + (16 * i)"
                dy="0.35em"
                :style="fontSlices"
              >{{partName}}</text>
            </g>
          </svg>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import {
  select,
  selectAll,
  scaleOrdinal,
  scaleLinear,
  partition,
  hierarchy,
  format,
  arc,
  quantize,
  interpolateRainbow,
  interpolateCool,
  interpolateGnBu,
  interpolateRgb,
  interpolate
} from "d3";
var TWEEN = require("@tweenjs/tween.js");

export default {
  name: "ChartDonut",
  props: {
    linesData: {
      type: Object,
      default: function() {
        return {
          name: "",
          yearsData: []
        };
      }
    },
    idDonut: {
      type: String,
      default: "donut"
    },
    formatTxt: {
      type: String,
      default: "upCase"
    },
    dataDonut: Object,
    displaySunburst: {
      type: Object,
      default: {
        targetIndex: 0,
        color: {
          colorScale: "interpolateRainbow",
          colorMin: "rgba(12, 204, 249, 1)",
          colorMax: "rgba(162, 255, 174, 1)",
          opacity: 0.6,
          childrenOpacity: {
            present: false,
            opacity: 0.4
          }
        },
        nbRing: "all",
        radiusCenter: 100,
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
            present: false,
            font: {
              size: 10,
              family: "sans-serif"
            },
            rotation: "transform string"
          },
          joinSlices: { present: false, bornInclusion: [0, 29720540] },
          supprSlices: {
            present: false,
            keepData: null,
            bornExclusion: [0, 0],
            into: true
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
          center: false,
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
    }
  },
  data: function() {
    return {
      span: ["span"],
      notResize: true,
      targetIndex: 0,
      currentRing: 0,
      currentPathCenter: null,
      tweenedCoord: [],
      targetCoords: [],
      mLeave: false,
      sequences: {
        colorName: null,
        seqNames: [],
        labelBudget: null,
        currentHover: null
      },
      centerInfos: {
        name: null,
        value: null
      },
      majW: null,
      minW: null,
      mixW: null,
      labelW: null,
      fontHeight: null,
      explanationsPos: null,
      chartPos: this.setChartPos(),
      fontSlices:
        "font: " +
        this.displaySunburst.slices.text.font.size +
        "px " +
        this.displaySunburst.slices.text.font.family,
      fontEndLabel:
        "font: " +
        this.displaySunburst.sequence.endLabel.font.size +
        "px " +
        this.displaySunburst.sequence.endLabel.font.family +
        "; font-weight:" +
        this.displaySunburst.sequence.endLabel.font.weight,
      fontSeq:
        "font: " +
        this.displaySunburst.sequence.font.size +
        "px " +
        this.displaySunburst.sequence.font.family
    };
  },
  model: {
    prop: "linesData",
    event: "update:linesData"
  },
  updated: function() {
    this.explanationsPos = this.setExplanationsPos();
  },
  mounted: function() {
    this.majW =
      this.formatTxt === "upCase"
        ? document.getElementById("maj").offsetWidth / 21
        : document.getElementById("mix").offsetWidth / 21;
    this.minW = document.getElementById("min").offsetWidth / 21;
    this.mixW = document.getElementById("mix").offsetWidth / 21;
    this.labelW = document.getElementById("label").offsetWidth / 8;
    this.fontHeight = document.getElementById("mix").offsetHeight;
    this.explanationsPos = this.setExplanationsPos();
  },
  computed: {
    displayBudget: function() {
      // transform.budget = (transform.budget / 1000000).toFixed(2);
      return this.sequences.currentHover
        ? this.sequences.labelBudget
        : (this.transformData.budget / 1000000).toFixed(2);
    },
    interpolator: function() {
      if (this.displaySunburst.color.colorScale === "interpolateCool")
        return interpolateCool;
      else if (this.displaySunburst.color.colorScale === "interpolateRainbow")
        return interpolateRainbow;
      else if (this.displaySunburst.color.colorScale === "interpolateRgb")
        return interpolateRgb(
          this.displaySunburst.color.colorMin,
          this.displaySunburst.color.colorMax
        );
    },
    colorScale: function(bla) {
      return scaleOrdinal(
        quantize(this.interpolator, this.transformData.children.length + 1)
      );
    },
    fontExplanations: function() {
      let cursor = !this.displaySunburst.slices.zoomable
        ? null
        : ` cursor: pointer;`;
      return (
        "font: " +
        this.displaySunburst.explanationsCenter.font.size +
        "px " +
        this.displaySunburst.explanationsCenter.font.family +
        "; width: " +
        (this.displaySunburst.radiusCenter - 10) +
        "px;" +
        cursor
      );
    },
    transformData: function() {
      let transform = {
        name: this.dataDonut.name,
        children: [],
        budgetProgess: [],
        budget: 0
      };

      let newChildren = [];
      let subChild = [];
      let budget = 0;
      let budgetProgess = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];

      //suppr slices inutiles
      if (!this.displaySunburst.slices.supprSlices.keepData) {
        transform.children = this.dataDonut.children.filter(child => {
          if (this.displaySunburst.slices.supprSlices.present) {
            if (this.displaySunburst.slices.supprSlices.into)
              return (
                this.displaySunburst.slices.supprSlices.bornExclusion[0] <
                  child.budget &&
                child.budget <
                  this.displaySunburst.slices.supprSlices.bornExclusion[1]
              );
            else
              return (
                this.displaySunburst.slices.supprSlices.bornExclusion[0] <
                  child.budget &&
                child.budget <=
                  this.displaySunburst.slices.supprSlices.bornExclusion[1]
              );
          }
          return child;
        });
      } else
        transform = this.dataDonut.children.filter(
          child =>
            child.name === this.displaySunburst.slices.supprSlices.keepData
        )[0];

      //join data
      if (this.displaySunburst.slices.joinSlices.present) {
        transform.children.forEach(child => {
          if (
            child.budget >=
              this.displaySunburst.slices.joinSlices.bornInclusion[0] &&
            child.budget <=
              this.displaySunburst.slices.joinSlices.bornInclusion[1]
          ) {
            subChild.push(child);
            budget += child.budget;
          } else newChildren.push(child);
        });
        newChildren.push({
          budget: budget,
          // budgetProgess: budgetProgess,
          name:
            this.formatTxt === "upCase" ? "AUTRES CHARGES" : "Autres charges",
          children: subChild
        });
        transform.children = newChildren;
      }
      // console.log(transform.children);
      if (
        !this.displaySunburst.slices.supprSlices.keepData &&
        !this.displaySunburst.slices.joinSlices.present
      ) {
        transform.name =
          this.formatTxt === "upCase" ? "AUTRES CHARGES" : "Autres charges";
        transform.children.forEach(child => {
          budgetProgess[0] = budgetProgess[0].map((num, i) => {
            return num + child.budgetProgess[0][i].y;
          });
          budgetProgess[1] = budgetProgess[1].map((num, i) => {
            return num + child.budgetProgess[1][i].y;
          });
        });
        budgetProgess = budgetProgess.map(array =>
          array.map((value, i) => {
            return {
              x: transform.children[0].budgetProgess[0][i].x,
              y: value
            };
          })
        );
        // console.log("budget progress", budgetProgess);
        this.$emit("update:linesData", {
          name:
            this.formatTxt === "upCase" ? "AUTRES CHARGES" : "Autres charges",
          budgetProgess: budgetProgess
        });
        transform.budgetProgess = budgetProgess;
      }
      // });
      // }
      if (!this.displaySunburst.slices.supprSlices.keepData)
        transform.children.forEach(child => (transform.budget += child.budget));

      transform.children.forEach(child => {
        let n =
          this.formatTxt === "upCase" ? "AUTRES CHARGES" : "Autres charges";
        if (child.name === n) {
          child.children.forEach(subchild => {
            budgetProgess[0] = budgetProgess[0].map((num, i) => {
              return num + subchild.budgetProgess[0][i].y;
            });
            budgetProgess[1] = budgetProgess[1].map((num, i) => {
              return num + subchild.budgetProgess[1][i].y;
            });
          });
          budgetProgess = budgetProgess.map(array =>
            array.map((value, i) => {
              return {
                x: child.children[0].budgetProgess[0][i].x,
                y: value
              };
            })
          );
          // console.log("budget progress", budgetProgess);
          child["budgetProgess"] = budgetProgess;
          this.$emit("update:linesData", {
            name:
              this.formatTxt === "upCase" ? "AUTRES CHARGES" : "Autres charges",
            budgetProgess: budgetProgess
          });
        }
      });

      return transform;
    },
    root: function() {
      // console.log("trnaformData", this.transformData);
      let root = hierarchy(this.transformData)
        .sum(d => {
          return d.value;
        })
        .sort((a, b) => b.value - a.value);

      this.partition(root);
      // console.log("root", root.descendants());
      // console.log("root", root);

      let i = -1;
      root.each(d => {
        ++i;
        return (d.position = i);
      });

      if (this.displaySunburst.targetIndex) {
        let p = root.descendants()[this.displaySunburst.targetIndex];
        let maxDepth = this.searchMaxDepth(p);
        // console.log(maxDepth - p.depth + 1, this.displaySunburst.nbRing)
        let radiusDivider =
          this.displaySunburst.nbRing === "all" ||
          maxDepth - p.depth + 1 <= this.displaySunburst.nbRing
            ? maxDepth - p.depth + 1
            : this.displaySunburst.nbRing;
        let maxDomain =
          this.displaySunburst.nbRing === "all" ||
          p.depth >= this.displaySunburst.nbRing
            ? maxDepth
            : this.displaySunburst.nbRing;
        let newPartY =
          (this.radius - this.displaySunburst.radiusCenter) / radiusDivider;
        let r0Scale = scaleLinear();
        let r1Scale = scaleLinear();
        r0Scale
          .range([this.displaySunburst.radiusCenter, this.radius - newPartY])
          .domain([p.depth, maxDomain]);
        r1Scale
          .range([newPartY + this.displaySunburst.radiusCenter, this.radius])
          .domain([p.depth, maxDomain]);
        root.each(d => {
          let newX0 =
              d.depth > maxDomain && this.displaySunburst.nbRing !== "all"
                ? 0
                : Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
                  2 *
                  Math.PI,
            newX1 =
              d.depth > maxDomain && this.displaySunburst.nbRing !== "all"
                ? 0
                : Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
                  2 *
                  Math.PI,
            newY0 =
              d.depth > maxDomain && this.displaySunburst.nbRing !== "all"
                ? 0
                : (newX1 - newX0 === 2 * Math.PI &&
                    d.data.name !== p.data.name) ||
                  d.depth === 0
                ? 0
                : r0Scale(d.depth),
            newY1 =
              d.depth > maxDomain && this.displaySunburst.nbRing !== "all"
                ? 0
                : newX1 - newX0 === 2 * Math.PI && d.data.name !== p.data.name
                ? this.displaySunburst.radiusCenter
                : r1Scale(d.depth);
          // console.log(d.depth, maxDomain, newX1 - newX0, 2 * Math.PI, d.data.name, p.data.name, r0Scale(d.depth))
          return (d.target = {
            x0: newX0,
            x1: newX1,
            y0: newY0,
            y1: newY1
          });
        });
      }
      return root;
    },
    radius: function() {
      return this.displaySunburst.sizes.sunburstW / 2;
    },
    partition: function() {
      return partition().size([2 * Math.PI, this.radius]);
    },
    arcSlice: function() {
      let arcSlice = arc()
        .startAngle(d => {
          return d.x0;
        })
        .endAngle(d => {
          return d.x1;
        })
        .padAngle(d => {
          return Math.min((d.x1 - d.x0) / 2, 0.005);
        })
        .padRadius(this.radius / 2)
        .innerRadius(d => {
          return d.y0;
        })
        .outerRadius(d => {
          return d.y1 - 1;
        });
      return arcSlice;
    },
    slices: function() {
      function lookUpForParentName(slice) {
        if (slice.parent && slice.parent.depth > 0) {
          return lookUpForParentName(slice.parent);
        } else {
          return slice.data.name;
        }
      }

      let maxDepth = this.searchMaxDepth(this.root);
      // console.log(maxDepth - p.depth + 1, this.displaySunburst.nbRing)
      let newPartY =
        (this.radius - this.displaySunburst.radiusCenter) / maxDepth;
      let r0Scale = scaleLinear();
      let r1Scale = scaleLinear();
      r0Scale
        .range([this.displaySunburst.radiusCenter, this.radius - newPartY])
        .domain([1, maxDepth]);
      r1Scale
        .range([newPartY + this.displaySunburst.radiusCenter, this.radius])
        .domain([1, maxDepth]);

      let amppedSlices = this.root.descendants().map(slice => {
        if (slice.parent) {
          slice.parentName = lookUpForParentName(slice);
        } else slice.parentName = "";
        slice.current = {
          x0:
            slice.depth > this.currentRing + 1 &&
            this.displaySunburst.nbRing !== "all"
              ? 0
              : slice.x0,
          x1:
            slice.depth > this.currentRing + 1 &&
            this.displaySunburst.nbRing !== "all"
              ? 0
              : slice.x1,
          y0:
            (slice.depth > this.currentRing + 1 &&
              this.displaySunburst.nbRing !== "all") ||
            slice.depth === 0
              ? 0
              : this.displaySunburst.nbRing === "all"
              ? r0Scale(slice.depth) // all rings at the begining
              : slice.y0 + this.displaySunburst.radiusCenter / 2, // if just 1 ring at the begining
          y1:
            slice.depth > this.currentRing + 1 &&
            this.displaySunburst.nbRing !== "all"
              ? 0
              : this.displaySunburst.nbRing === "all"
              ? r1Scale(slice.depth)
              : //slice.y1 + this.displaySunburst.radiusCenter / 2 // all rings at the begining
                this.radius // if just 1 ring at the begining
        };
        return slice;
      });
      this.currentCoords = amppedSlices.map(slice => slice.current);
      if (amppedSlices[0].target) {
        this.targetCoords = amppedSlices.map(elem => elem.target);
      }
      if (this.displaySunburst.targetIndex === 0)
        this.targetCoords = this.currentCoords;
      // console.log("here", amppedSlices[0].target, this.currentCoords, this.targetCoords, this.displaySunburst.targetIndex)
      // nb d'anneaux au sunburst
      if (this.displaySunburst.nbRing !== "all")
        amppedSlices = amppedSlices.filter(
          slice =>
            slice.depth <= this.currentRing + this.displaySunburst.nbRing - 1
        );
      return amppedSlices;
    },
    texts: function() {
      let textData = this.root.descendants().map((d, i) => {
        let x0 = d.target ? d.target.x0 : d.current.x0,
          x1 = d.target ? d.target.x1 : d.current.x1,
          y0 = d.target ? d.target.y0 : d.current.y0,
          y1 = d.target ? d.target.y1 : d.current.y1;
        const x = (((x0 + x1) / 2) * 180) / Math.PI;
        const y = (y0 + y1) / 2;

        let transform = `rotate(${x - 90}) translate(${y},0) rotate(${
          x < 180 ? 0 : 180
        })`;
        let name = [];
        name.push(d.data.name);
        // console.log(name.length * this.majW, y1 - y0, name, d.depth, this.currentRing, this.displaySunburst.targetIndex, i);
        if (name[0].length * this.majW > y1 - y0 && y1 - y0 !== 0) {
          let wordAr = name[0].split(/\s+/);
          let strArr = [];
          this.reduceSliceText(wordAr, y1 - y0, strArr);
          name = strArr;
        }
        // console.log(
        //   name.length * this.fontHeight,
        //   ((y0 + y1) / 2) * (x1 - x0),
        //   y0,
        //   name
        // );
        let display =
          ((y0 + y1) / 2) * (x1 - x0) > 10 &&
          y0 !== 0 &&
          ((y0 + y1) / 2) * (x1 - x0) > name.length * this.fontHeight;
        return {
          display: display,
          name: name,
          transform: transform
        };
      });
      return textData;
    },
    translateChart: function() {
      return `translate(${this.displaySunburst.sizes.sunburstW / 2}, ${this
        .displaySunburst.sizes.sunburstW / 2})`;
    },
    translatePolygon: function() {
      let antL = 0;
      let b = [];
      // console.log("polygon", this.sequences.seqNames);
      this.sequences.seqNames.forEach((elem, i) => {
        let l = 0;
        if (i !== 0) l = antL * this.majW + 2 + b[i - 1] + 20;
        b.push(l);
        antL = Math.max(...elem.map(span => span.length));
        i++;
      });
      // x label budget
      b.push(antL * this.majW + 2 + b[b.length - 1] + 20);
      // console.log(b)
      return b;
    },
    legends: function() {
      this.proportionTextSeq();
      let legendsNames = this.root
        .descendants()
        .filter(elem => elem.depth === 1)
        .map(elem => elem.data.name);

      let arrayName = [],
        arrayLegendsNames = [];
      let nbSpan = 0,
        rectSize = 18 + 4;

      legendsNames.forEach(name => {
        // console.log(name.length * this.majW, this.majW, name.length, name, this.displaySunburst.sizes.legendW);
        if (
          name.length * this.majW >
          this.displaySunburst.sizes.legendW - rectSize
        )
          arrayName = this.reduceLegendTxt(
            name,
            this.displaySunburst.sizes.legendW - rectSize
          );
        else arrayName = [name];
        nbSpan += arrayName.length;
        arrayLegendsNames.push(arrayName);
      });

      let longestName = 0;
      arrayLegendsNames.forEach(name => {
        name.forEach(elem => {
          // console.log(elem.length)
          if (longestName < elem.length) longestName = elem.length;
        });
      });
      return {
        names: legendsNames,
        arrayNames: arrayLegendsNames,
        width: longestName,
        nbSpan: nbSpan
      };
    }
  },
  watch: {
    targetCoords: function(newSet, oldSet) {
      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }
      // console.log("newSet",newSet, oldSet)
      newSet.forEach((elem, i) => {
        new TWEEN.Tween(
          oldSet.length && oldSet[i] ? oldSet[i] : this.currentCoords[i]
        )
          .to(elem, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(set => {
            const x = (((set.x0 + set.x1) / 2) * 180) / Math.PI;
            const y = (set.y0 + set.y1) / 2;
            select("." + this.idDonut + " #slice" + i).attr(
              "d",
              this.arcSlice(set)
            );
            select("." + this.idDonut + " #text" + i).attr(
              "transform",
              `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
            );
          })
          .start();
      });
      animate();
    }
  },
  methods: {
    createDivText: function(text, font) {
      let newDiv = document.createElement("div");
      newDiv.innerHTML = "<span class='toto'>" + text + "</span>";
      newDiv.style.fontFamily = "Poppins";
      newDiv.style.fontSize = "11px";
      // newDiv.children[0].setAttribute("class", "toto")

      let currentDiv = document.getElementById("app");
      currentDiv.appendChild(newDiv);

      console.log("childDiv", newDiv.children, newDiv.children[0].offsetWidth, font)

      let hDiv = newDiv.children[0].offsetHeight;
      let lDiv = newDiv.children[0].offsetWidth;
      
      // console.log("toto",document.querySelector(".toto"))
      // currentDiv.removeChild(newDiv);

      // return {
      //   height: hDiv,
      //   width: lDiv
      // };
    },
    translateLegend: function(names, index, legend) {
      let h = 0;
      // console.log("names", names, legend.join(" ").trim());
      if (index === 0) return `translate(0, ` + 33 * index + `)`;
      else {
        for (let i = 0; i < index; i++) {
          if (names[i].length === 1) h += 18 + 15;
          else h += 2.5 + names[i].length * 12 + (names[i].length - 1) + 15;
        }
        return `translate(0, ` + h + `)`;
      }
    },
    reduceLegendTxt: function(name, legendTxtSize) {
      let words = name.split(/\s+/),
        partName = "",
        arrayName = [],
        a = 0;

      words.some((word, i) => {
        if (partName.concat(" ", word).length * this.majW < legendTxtSize)
          partName = partName.concat(" ", word).trim();
        else if (a === 0) return (a = i);
      });

      if (a) {
        arrayName.push(partName);
        words = words.slice(a);
        if (words.join(" ").length * this.majW > legendTxtSize) {
          this.reduceLegendTxt(words.join(" ").trim(), arrayName);
        } else {
          arrayName.push(words.join(" ").trim());
        }
      } else arrayName.push(name);
      return arrayName;
    },
    setChartPos: function() {
      let proportion =
        window.innerWidth > 600 && this.displaySunburst.legends.present
          ? "xs8"
          : "xs12";
      let offset = this.displaySunburst.sizes.offset;

      return proportion + " " + offset;
    },
    onResize() {
      let doc = document.getElementsByClassName(this.idDonut);
            this.createDivText("name", this.fontSlices)

      let child = doc[0].children[0].children;
      let seqW = child.sequence.offsetWidth;
      let legW = child.sidebar ? child.sidebar.offsetWidth : null;
      // console.log("resize", child, legW, this.displaySunburst.sizes.legendW, this.displaySunburst.sizes.sequenceW);
      if (this.notResize === false) {
        this.displaySunburst.sizes.sequenceW = seqW;
        this.displaySunburst.sizes.legendW =
          legW > this.legends.width * this.majW + 25
            ? this.legends.width * this.majW + 25
            : legW;
      } else {
        // console.log(this.legends.width, this.majW)
        this.notResize = false;
        this.displaySunburst.sizes.legendW =
          this.displaySunburst.sizes.legendW > this.legends.width * 6.4 + 25
            ? this.legends.width * 6.4 + 25
            : this.displaySunburst.sizes.legendW;
      }
      this.explanationsPos = this.setExplanationsPos();

      if (window.innerWidth > 600 && this.displaySunburst.legends.present)
        this.chartPos = "xs8";
      else this.chartPos = "xs12";
    },

    searchMaxDepth(p) {
      let maxDepth = 0;
      p.each(elem => {
        if (elem.children)
          elem.children.forEach(child => {
            this.searchMaxDepth(child);
          });
        maxDepth = elem.depth;
      });
      return maxDepth;
    },
    visibleArc(index, slice) {
      if (
        (index === 0 && !this.displaySunburst.slices.center.visibility) ||
        (this.root.descendants()[index].target &&
          this.root.descendants()[index].target.y0 === 0 &&
          this.displaySunburst.explanationsCenter.present)
      )
        return 0;
      return slice.children
        ? this.displaySunburst.color.opacity
        : this.displaySunburst.color.childrenOpacity.present
        ? this.displaySunburst.color.childrenOpacity.opacity
        : this.displaySunburst.color.opacity;
    },
    sizeWords(wordAr, ringSize) {
      let sizeOk = true;
      wordAr.forEach(word => {
        if (word.length * this.majW > ringSize) sizeOk = false;
      });
      return sizeOk;
    },
    reduceSliceText(wordAr, ringSize, strArr) {
      let str = "";
      let a = 0;

      if (this.sizeWords(wordAr, ringSize)) {
        wordAr.forEach((word, i) => {
          if (i === 0 && str.concat("", word).length * this.majW < ringSize) {
            str = str.concat("", word);
          } else if (str.concat(" ", word).length * this.majW < ringSize) {
            str = str.concat(" ", word);
            a = i;
          }
        });
        wordAr = wordAr.slice(a + 1);
        if (str) strArr.push(str);
        // console.log("ici", str, wordAr, wordAr.join(" ").length);
        if (wordAr.join(" ").length * this.majW > ringSize) {
          this.reduceSliceText(wordAr, ringSize, strArr);
        } else {
          if (wordAr.length) strArr.push(wordAr.join(" "));
        }
      }
    },
    smallestFirstWordsArr(
      allWordsArr,
      reducer,
      sizeSeq,
      sizeLabel,
      maxWordLength
    ) {
      let fullNameLength = allWordsArr.map(arrayW =>
        arrayW.length === 1 ? 1 : arrayW.join(" ").length
      );
      allWordsArr = allWordsArr.map((arrayW, i) => {
        // console.log("maxLen", maxWordLength[i], arrayW.join(" ").length, arrayW.join(" "), Math.max(...fullNameLength))
        if (
          arrayW.join(" ").length === Math.max(...fullNameLength) &&
          arrayW.join(" ").length > maxWordLength[i]
        )
          arrayW = arrayW.slice(0, arrayW.length - 1);
        return arrayW;
      });
      let array = allWordsArr.map((arrayW, i) => {
        // console.log("join",arrayW.join(" ").length, maxWordLength[i], arrayW.join(" ").length > maxWordLength[i] ? arrayW.join(" ").length : maxWordLength[i])
        return arrayW.join(" ").length > maxWordLength[i]
          ? arrayW.join(" ").length
          : maxWordLength[i];
        // return arrayW.join(" ").length * this.majW + 20
      });
      // console.log("array", allWordsArr, array, array.reduce(reducer) * this.majW + (maxWordLength.length * 25), sizeSeq - sizeLabel);

      let sumW = array.reduce(reducer);
      if (sumW * this.majW + maxWordLength.length * 25 > sizeSeq - sizeLabel)
        return this.smallestFirstWordsArr(
          allWordsArr,
          reducer,
          sizeSeq,
          sizeLabel,
          maxWordLength
        );

      allWordsArr = allWordsArr.map(arrayW => arrayW.join(" "));
      return allWordsArr;
    },
    reduceNbW(allWordsArr, sizeSeq, sizeLabel) {
      // console.log("reduceNB", allWordsArr);
      let nbWords = allWordsArr.map(arrayW => arrayW.length);
      let maxWordLength = allWordsArr.map(arrayW =>
        Math.max(...arrayW.map(word => word.length))
      );

      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      // console.log(
      //   "reduceNbW",
      //   maxWordLength,
      //   maxWordLength.reduce(reducer),
      //   this.majW,
      //   maxWordLength.reduce(reducer) * this.majW,
      //   sizeSeq - sizeLabel,
      //   sizeSeq,
      //   allWordsArr
      // );
      if (
        maxWordLength.reduce(reducer) * this.majW + maxWordLength.length * 25 <
        sizeSeq - sizeLabel
      ) {
        // console.log(allWordsArr, maxWordLength)
        return (allWordsArr = this.smallestFirstWordsArr(
          allWordsArr,
          reducer,
          sizeSeq,
          sizeLabel,
          maxWordLength
        ));
      } else return;
    },
    reduceSecondLine: function(word, tspan, newSpan) {
      let splitSpan = tspan.split(/\s+/);
      let l = 0,
        index = 0;
      // console.log(tspan);
      splitSpan.forEach((spanWord, i) => {
        // console.log("spanW", spanWord);
        l += spanWord.length + 1;
        if (l <= word.length + 1) index = i;
      });
      let newSpan1 = splitSpan.slice(0, index + 1).join(" ");
      let newSpan2 =
        splitSpan.length > 1
          ? splitSpan.slice(index + 1, splitSpan.length).join(" ")
          : null;
      newSpan.push(newSpan1);

      if (newSpan2 && newSpan2.length > word.length)
        return this.reduceSecondLine(word, newSpan2, newSpan);
      else if (newSpan2) newSpan.push(newSpan2);
      return newSpan;
    },
    blabla(endLabelW, endLabelP, seqNamesBase) {
      let wordAr = seqNamesBase.map(elem => elem[0].split(/\s+/));
      wordAr = this.reduceNbW(
        wordAr,
        this.displaySunburst.sizes.sequenceW,
        endLabelW + endLabelP
      );
      // console.log("wordAr", wordAr);

      if (wordAr) {
        return seqNamesBase.map((elem, i) => {
          // console.log("seqbase", elem, elem[0], wordAr[i]);
          if (elem[0] !== wordAr[i]) {
            let tspan = elem[0].split(wordAr[i] + " ");
            // console.log("tspan", tspan);
            elem = [wordAr[i], tspan[1]];
            // console.log("elem here",elem)
            if (tspan[1] && wordAr[i].length < tspan[1].length) {
              let newSpan = [];
              newSpan = this.reduceSecondLine(wordAr[i], tspan[1], newSpan);
              elem = [wordAr[i]].concat(newSpan);
            } else if (tspan[0] !== "") elem = tspan;
          }
          return elem;
        });
      } else {
        let alreadyPass = false;
        let nbpoints = 0;
        // let emptyArr = [[]]
        if (seqNamesBase[0][0] === "...") alreadyPass = true;
        seqNamesBase.forEach(elem => {
          if (elem[0] === "...") nbpoints += 1;
        });
        if (nbpoints === seqNamesBase.length) return [];
        let newSeqNames = seqNamesBase.map((elem, i) => {
          if (i !== seqNamesBase.length - 1 || alreadyPass) elem = ["..."];
          return elem;
        });
        return this.blabla(endLabelW, endLabelP, newSeqNames);
      }
    },
    proportionTextSeq: function() {
      let newSeqNames = this.sequences.seqNames;
      // console.log("seqname", newSeqNames);
      if (this.sequences.seqNames.length) {
        let array = this.sequences.seqNames.map(
          elem => elem[0].length * this.majW + 25
        );
        // pas encore en span

        const reducer = (accumulator, currentValue) =>
          accumulator + currentValue;

        let endLabelW =
            (this.sequences.labelBudget.length +
              this.displaySunburst.sequence.endLabel.unit.length +
              1) *
            this.labelW,
          endLabelP = 15;

        let sumW = array.reduce(reducer);
        // console.log("seqw", this.displaySunburst.sizes.sequenceW);
        // console.log(
        //   "Wendlabel",
        //   endLabelW,
        //   array,
        //   sumW,
        //   this.displaySunburst.sizes.sequenceW - endLabelW - endLabelP
        // );

        if (
          sumW >
          this.displaySunburst.sizes.sequenceW - endLabelW - endLabelP
        ) {
          let newSeqNames = this.blabla(
            endLabelW,
            endLabelP,
            this.sequences.seqNames
          );

          newSeqNames = newSeqNames.map(arrName => {
            // console.log(arrName)
            if (arrName.length > 5) {
              let maxLenSpan = Math.max(...arrName.map(span => span.length));
              arrName = arrName.slice(0, 5);
              if (arrName[4].length + 4 > maxLenSpan) {
                let span4 = arrName[4].split(/\s+/);
                let name = "";
                span4.forEach((word, i) => {
                  if (name.length + word.length + 4 <= maxLenSpan)
                    name =
                      i === 0 ? name.concat("", word) : name.concat(" ", word);
                });
                if (name === "") name = "...";
                arrName[4] = name;
              } else arrName[4] = arrName[4].concat(" ...");
            }
            return arrName;
          });
          this.sequences.seqNames = newSeqNames;
          // console.log("new", newSeqNames);
        }
      }
    },
    notCenter(names) {
      // console.log("notcenter", names, names[0][0], this.root.descendants()[0].data.name)
      if (
        names[0][0] === this.root.descendants()[0].data.name &&
        !this.displaySunburst.slices.center.visibility &&
        names.length === 1
      ) {
        return false;
      }
      return true;
    },
    polygonPoints(allSpan, allNames) {
      // console.log("points", allNames)
      let nbSpanText = allNames.map(span => span.length);
      let maxLSpan = Math.max(...allSpan.map(span => span.length));
      let maxH = Math.max(...nbSpanText);
      // console.log("span",allSpan, maxLSpan)
      let a = maxLSpan * this.majW + 20, //padding
        b = a + 10, //pointe
        c =
          maxH > 2 ? (maxH + 1) * this.displaySunburst.sequence.font.size : 30,
        d = c / 2;
      return (
        "0,0 " +
        a +
        ",0 " +
        b +
        "," +
        d +
        " " +
        a +
        "," +
        c +
        " 0," +
        c +
        " 10," +
        d
      );
    },
    ySpan: function(sequence, allNames) {
      let allLength = allNames.map(elem => elem.length);
      let maxL = Math.max(...allLength);

      // console.log(sequence, allNames)

      let ySpanScale = scaleLinear();
      ySpanScale.range([(maxL + 1) * 5, 15]).domain([1, maxL]);
      // console.log(ySpanScale(sequence.length))
      let a =
        sequence.length === maxL
          ? maxL === 1
            ? 15
            : 13
          : ySpanScale(sequence.length);
      // console.log(sequence, a)
      return a;
    },
    bou(ring) {
      console.log(ring);
    },
    clicked(index, idDonut) {
      if (this.root.descendants()[index]) {
        if (idDonut === "donut2") {
          let posParent = this.root.descendants()[index].parent
            ? this.root.descendants()[index].parent.position
            : 0;
          this.currentPathCenter = posParent;

          this.currentRing = this.root.descendants()[index].depth;
        }
        // console.log("dataDonut in click", this.root.descendants()[index])
        this.$emit("onClick", this.root.descendants()[index], idDonut, index);
      }
    },

    setExplanationsPos: function() {
      let newDiv = document.createElement("div");
      // console.log(this.sequences, this.transformData)
      let name = this.sequences.currentHover
        ? this.sequences.currentHover
        : this.transformData.name;
      newDiv.innerHTML =
        name +
        "<br><br><span>" +
        this.sequences.labelBudget +
        " " +
        this.displaySunburst.sequence.endLabel.unit +
        "</span>";
      newDiv.setAttribute("id", "explanation");
      newDiv.setAttribute("style", this.fontExplanations);

      let currentDiv = document.getElementById("app");
      currentDiv.appendChild(newDiv);

      let donut = document.getElementsByClassName(this.idDonut),
        chartW = donut[0].children[0].children.chart.offsetWidth;
      
      // console.log(chartW, this.displaySunburst.sizes.maxW)
      if (chartW > 200 && chartW < this.displaySunburst.sizes.maxW) {
        this.displaySunburst.sizes.sunburstW = chartW;
        this.displaySunburst.radiusCenter =
          chartW / 4 > this.displaySunburst.sizes.center
            ? this.displaySunburst.sizes.center
            : chartW / 4;
      } else if (chartW >= this.displaySunburst.sizes.maxW) {
        this.displaySunburst.sizes.sunburstW = this.displaySunburst.sizes.maxW;
        this.displaySunburst.radiusCenter = this.displaySunburst.sizes.center;
      }

      let hDiv = newDiv.offsetHeight;
      let tDiv = this.displaySunburst.sizes.sunburstW / 2 - hDiv / 2;
      let lDiv = chartW / 2 - (this.displaySunburst.radiusCenter - 10) / 2;

      currentDiv.removeChild(newDiv);

      return "top: " + tDiv + "px; left: " + lDiv + "px;";
    },

    // legendOver(index) {
    //   let doc = this;

    //   function overChildren(slice, idDonut) {
    //     if (slice.children && slice.children.length) {
    //       slice.children.forEach(child => {
    //         select("." + idDonut + " #slice" + child.position).style(
    //           "opacity",
    //           1
    //         );
    //         if (child.children && child.children.length)
    //           overChildren(child, idDonut);
    //       });
    //     }
    //   }

    //   selectAll("." + doc.idDonut + " #chart path").style("opacity", 0.3);
    //   select("." + doc.idDonut + " #slice" + index).style("opacity", 1);

    //   overChildren(this.root.descendants()[index], this.idDonut);
    // },

    // lengendLeave() {
    //   let doc = this;
    //   this.mLeave = true;
    //   const turnOnHover = () => {
    //       doc.mLeave = false;
    //     };
    //   // console.log("leave",this.mLeave)
    //   selectAll("." + this.idDonut + " #chart path")
    //     .transition()
    //     .duration(500)
    //     .style("opacity", 1)
    //     .on("end", function() {
    //       console.log("end")
    //       turnOnHover();
    //     });
    // },

    mouseover(index) {
      let doc = this;

      function mouseOnCenter(doc) {
        doc.mLeave = true;
        const turnOnHover = () => {
          doc.mLeave = false;
          doc.sequences.seqNames = [];
          doc.sequences.currentHover = null;
        };

        selectAll("." + doc.idDonut + " #chart path")
          .transition()
          .duration(500)
          .style("opacity", 1)
          .on("end", function() {
            turnOnHover();
          });
      }
      function overParents(slice, doc, display, idDonut) {
        if (
          (slice.parent &&
            slice.parent.depth > 0 &&
            slice.parent.target &&
            slice.parent.target.y0 !== 0 &&
            display.explanationsCenter.present) ||
          (display.nbRing === "all" &&
            slice.parent &&
            !slice.parent.target &&
            slice.parent.depth > 0)
        ) {
          select("." + idDonut + " #slice" + slice.parent.position).style(
            "opacity",
            1
          );
          overParents(slice.parent, doc, display, idDonut);
        } else if (
          (slice.depth === 0 && !display.slices.center.visibility) ||
          (display.explanationsCenter.present &&
            slice.target &&
            slice.target.y0 === 0)
        ) {
          mouseOnCenter(doc);
        }
      }
      function setSequence(slice) {
        if (slice.parent && slice.parent.depth > 0) {
          seqNames.push(slice.parent.data.name);
          setSequence(slice.parent);
        }
      }

      selectAll("." + doc.idDonut + " #chart path").style("opacity", 0.3);
      select("." + doc.idDonut + " #slice" + index).style("opacity", 1);
      overParents(
        this.root.descendants()[index],
        this,
        this.displaySunburst,
        this.idDonut
      );
      this.sequences.colorName = this.root.descendants()[index].parentName;
      this.sequences.currentHover =
        (index &&
          (this.root.descendants()[index].target &&
            this.root.descendants()[index].target.y0 !== 0)) ||
        (index && !this.root.descendants()[index].target)
          ? this.root.descendants()[index].data.name
          : null;

      this.explanationsPos = this.setExplanationsPos();

      let seqNames = [];
      seqNames.push(this.root.descendants()[index].data.name);
      setSequence(this.root.descendants()[index]);
      seqNames = seqNames.reverse();
      this.sequences.seqNames = seqNames.map(elem => {
        let arrayName = [];
        arrayName.push(elem);
        return arrayName;
      });

      let budget = this.root.descendants()[index].data.value
        ? this.root.descendants()[index].data.value / 1000000
        : this.root.descendants()[index].data.budget / 1000000;
      this.sequences.labelBudget = budget.toFixed(2);
    },

    mouseleave() {
      this.mLeave = true;
      const turnOnHover = () => {
        this.mLeave = false;
        this.sequences.seqNames = [];
        this.sequences.currentHover = null;
      };

      selectAll("." + this.idDonut + " #chart path")
        .transition()
        .duration(500)
        .style("opacity", 1)
        .on("end", function() {
          turnOnHover();
        });
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
/* #chart {
  display: flex;
} */
.width_text {
  height: 0px;
}
#explanation {
  position: absolute;
  z-index: 1;
  text-align: center;
}

#legend {
  padding-top: 10px;
}
.toto {
  font: 11px 'Poppins'
}
</style>