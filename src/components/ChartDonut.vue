<template>
  <v-container pa-0 fill-height :class="idDonut">
    <v-layout :class="displaySunburst.sequence.center ? `justify-center` : ``" wrap id="donutChart">
      <v-flex xs12 class="width_text" :style="fontSlices+`;color: transparent;`">
        <span id="maj">ACHATS DE</span>
        <span id="min">achats de</span>
        <span id="mix">Achats de</span>
        <span id="label" :style="fontEndLabel">14.52 {{displaySunburst.sequence.endLabel.unit}}</span>
      </v-flex>
      <v-flex xs12 id="sequence" v-if="displaySunburst.sequence.present" v-resize="onResize">
        <svg width="100%" height="80" id="trail">
          <text
            v-if="sequences.seqNames.length && notCenter(sequences.seqNames) && displaySunburst.sequence.endLabel.present"
            id="endlabel"
            :x="translatePolygon[translatePolygon.length - 1] + 15"
            y="15"
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
        >
          {{sequences.currentHover ? sequences.currentHover.toUpperCase() : transformData.name}}
          <br>
          <br>
          <span
            id="labelBugdet"
          >{{sequences.currentHover ? sequences.labelBudget : transformData.budget}} {{displaySunburst.sequence.endLabel.unit}}</span>
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
              :style="!displaySunburst.slices.zoomable ? null : `cursor: pointer;`"
              @click="!displaySunburst.slices.zoomable ? null : clicked(index)"
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
      <v-flex xs10 sm2 pl-3 pt-5 id="sidebar" v-if="displaySunburst.legends.present">
        Legend
        <br>
        <div id="legend">
          <svg :width="legends.width * majW + 20" :height="legends.names.length * 33">
            <g
              v-for="(legend, index) in legends.names"
              :transform="`translate(0, `+ 33 * index +`)`"
              @click="!displaySunburst.legends.clickable ? null : clicked(index + 1)"
              :style="!displaySunburst.legends.clickable ? null : `cursor: pointer;`"
            >
              <rect
                rx="3"
                ry="3"
                width="18"
                height="18"
                :fill="colorScale(legend)"
                fill-opacity="0.6"
              ></rect>
              <text x="22" y="9" dy="0.35em" :style="fontSlices">{{legend.toUpperCase()}}</text>
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
  interpolate
} from "d3";
var TWEEN = require("@tweenjs/tween.js");

export default {
  name: "ChartDonut",
  props: {
    idDonut: {
      type: String,
      default: "donut"
    },
    dataDonut: Object,
    displaySunburst: {
      type: Object,
      default: {
        color: {
          colorScale: "interpolateRainbow",
          opacity: 0.6,
          childrenOpacity: {
            present: false,
            opacity: 0.6
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
      targetIndex: 0,
      currentRing: 0,
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
  updated: function() {
    this.explanationsPos = this.setExplanationsPos();
  },
  mounted: function() {
    this.majW = document.getElementById("maj").offsetWidth / 9;
    this.minW = document.getElementById("min").offsetWidth / 9;
    this.mixW = document.getElementById("mix").offsetWidth / 9;
    this.labelW = document.getElementById("label").offsetWidth / 8;
    this.fontHeight = document.getElementById("mix").offsetHeight;
    this.explanationsPos = this.setExplanationsPos();
  },
  computed: {
    interpolator: function() {
      if (this.displaySunburst.color.colorScale === "interpolateCool")
        return interpolateCool;
      else if (this.displaySunburst.color.colorScale === "interpolateRainbow")
        return interpolateRainbow;
    },
    colorScale: function() {
      return scaleOrdinal(
        quantize(this.interpolator, this.transformData.children.length + 1)
      );
    },
    fontExplanations: function() {
      return (
        "font: " +
        this.displaySunburst.explanationsCenter.font.size +
        "px " +
        this.displaySunburst.explanationsCenter.font.family +
        "; width: " +
        (this.displaySunburst.radiusCenter - 10) +
        "px;"
      );
    },
    transformData: function() {
      let a = {
        name: this.dataDonut.name.toUpperCase(),
        children: [],
        budget: 0
      };

      let newChildren = [];
      let subChild = [];
      let budget = 0;

      //suppr slices inutiles
      a.children = this.dataDonut.children.filter(child => {
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

      //join data
      if (this.displaySunburst.slices.joinSlices.present) {
        a.children.forEach(child => {
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
          name: "AUTRES",
          children: subChild
        });
        a.children = newChildren;
      }

      a.children.forEach(child => (a.budget += child.budget));
      a.budget = (a.budget / 1000000).toFixed(2);
      return a;
    },
    root: function() {
      let root = hierarchy(this.transformData)
        .sum(d => {
          return d.value;
        })
        .sort((a, b) => b.value - a.value);

      this.partition(root);
      // console.log("root", root.descendants());

      let i = -1;
      root.each(d => {
        ++i;
        return (d.position = i);
      });

      if (this.targetIndex) {
        let p = root.descendants()[this.targetIndex];
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
      if (this.targetIndex === 0) this.targetCoords = this.currentCoords;
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
        // console.log(name.length * this.majW, y1 - y0, name, d.depth, this.currentRing, this.targetIndex, i);
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
      let longestName = 0;

      legendsNames.forEach(elem => {
        if (longestName < elem.length) longestName = elem.length;
      });
      return {
        names: legendsNames,
        width: longestName
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
      // console.log(newSet)
      newSet.forEach((elem, i) => {
        new TWEEN.Tween(oldSet.length ? oldSet[i] : this.currentCoords[i])
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
      // console.log(doc[0].children[0].children.sequence.offsetWidth)
      this.displaySunburst.sizes.sequenceW =
        doc[0].children[0].children.sequence.offsetWidth;

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
    reduceNbW(wordAr, sizeSeq, sizeLabel) {
      // console.log(wordAr);
      let nbWords = wordAr.map(arrayW => arrayW.length);
      let wordLength = wordAr.map(
        arrayW => Math.max(...arrayW.map(word => word.length + 20))
      );
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      // console.log(wordLength, wordLength.reduce(reducer) * this.majW, sizeSeq - sizeLabel, sizeSeq, wordAr);
      if (wordLength.reduce(reducer) * this.majW < sizeSeq - sizeLabel) {
        // console.log("je passe la")
        let maxNbWords = Math.max(...nbWords);
        wordAr = wordAr.map(elem => {
          if (elem.length === maxNbWords) elem = elem.slice(0, elem.length - 1);
          return elem;
        });
        let array = wordAr.map(elem => elem.join(" ").length * this.majW + 20);
        // console.log(wordAr);

        let sumW = array.reduce(reducer);
        if (sumW > sizeSeq - sizeLabel)
          return this.reduceNbW(wordAr, sizeSeq, sizeLabel);

        wordAr = wordAr.map(elem => elem.join(" "));
        return wordAr;
      } else return;
    },
    reduceSecondLine: function(word, tspan, newSpan) {
      let splitSpan = tspan.split(/\s+/);
      let l = 0,
        index = 0;
      splitSpan.forEach((spanWord, i) => {
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
    proportionTextSeq: function() {
      let newSeqNames = this.sequences.seqNames;
      if (this.sequences.seqNames.length) {
        let array = this.sequences.seqNames.map(
          elem => elem[0].length * this.majW + 20
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
        // console.log("Wendlabel",endLabelW, array, sumW, this.displaySunburst.sizes.sequenceW - endLabelW - endLabelP)

        if (
          sumW >
          this.displaySunburst.sizes.sequenceW - endLabelW - endLabelP
        ) {
          let wordAr = this.sequences.seqNames.map(elem =>
            elem[0].split(/\s+/)
          );
          wordAr = this.reduceNbW(
            wordAr,
            this.displaySunburst.sizes.sequenceW,
            endLabelW + endLabelP
          );
          newSeqNames = wordAr
            ? this.sequences.seqNames.map((elem, i) => {
                // console.log(elem, wordAr[i])
                if (elem[0] !== wordAr[i]) {
                  let tspan = elem[0].split(wordAr[i] + " ");
                  elem = [wordAr[i], tspan[1]];
                  if (wordAr[i].length < tspan[1].length) {
                    let newSpan = [];
                    newSpan = this.reduceSecondLine(
                      wordAr[i],
                      tspan[1],
                      newSpan
                    );
                    elem = [wordAr[i]].concat(newSpan);
                  }
                }
                return elem;
              })
            : [];
          this.sequences.seqNames = newSeqNames;
          // console.log("new",newSeqNames)
        }
      }
    },
    notCenter(names) {
      if (
        names[0][0] === this.root.descendants()[0].data.name.toUpperCase() &&
        !this.displaySunburst.slices.center.visibility
      ) {
        return false;
      }
      return true;
    },
    polygonPoints(allSpan, allNames) {
      let nbSpanText = allNames.map(span => span.length);
      let maxLSpan = Math.max(...allSpan.map(span => span.length));
      let maxH = Math.max(...nbSpanText);
      // console.log("span",allSpan, maxLSpan)
      let a = maxLSpan * this.majW + 20, //padding
        b = a + 10, //pointe
        c = maxH > 2 ? (maxH + 1) * 10 : 30,
        d = maxH > 2 ? 5 + maxH * 5 : 15;
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

      let ySpanScale = scaleLinear();
      ySpanScale.range([(maxL + 1) * 5, 15]).domain([1, maxL - 1]);
      return sequence.length === maxL
        ? maxL === 1
          ? 15
          : 13
        : ySpanScale(sequence.length);
    },
    clicked(index) {
      this.targetIndex = index;
      this.currentRing = this.root.descendants()[index].depth;
      this.$emit("onClick", this.root.descendants()[index]);
    },

    setExplanationsPos: function() {
      let newDiv = document.createElement("div");
      // console.log(this.sequences, this.transformData)
      let name = this.sequences.currentHover
        ? this.sequences.currentHover
        : this.transformData.name;
      newDiv.innerHTML =
        name.toUpperCase() +
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
          seqNames.push(slice.parent.data.name.toUpperCase());
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
      seqNames.push(this.root.descendants()[index].data.name.toUpperCase());
      setSequence(this.root.descendants()[index]);
      seqNames = seqNames.reverse();
      this.sequences.seqNames = seqNames.map(elem => {
        let arrayName = [];
        arrayName.push(elem);
        return arrayName;
      });
      // console.log("seq", this.sequences.seqNames);
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
  text-align: center;
  color: rgb(94, 94, 94);
}
</style>