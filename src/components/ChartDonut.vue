<template>
  <div id="donutChart">
    <div id="sequence" >
      <svg width="750" height="50" id="trail">
        <text
          id="endlabel"
          x="429"
          y="15"
          dy="0.35em"
          text-anchor="middle"
          style="fill: rgb(0, 0, 0);"
        >0.201%</text>
        <g v-for="(sequence, index) in sequences.seqNames" :transform="`translate(`+ sequences.translatePolygon[index] +`, 0)`">
          <polygon :points="polygonPoints(sequence)" :fill="colorScale(sequences.colorName)"></polygon>
          <text :x="(sequence.length * 10 + 10) / 2" y="15" dy="0.35em" text-anchor="middle">{{sequence}}</text>
        </g>
      </svg>
    </div>
    <div id="chart">
      <div>
        <svg :height="width" :width="width" @mouseleave="mouseleave">
          <g fill-opacity="0.6" :transform="translate">
            <path
              v-for="(slice, index) in slices"
              :key="slice.id"
              :fill="colorScale(slice.parentName)"
              :id="`slice`+index"
              :d="arcSlice(slice)"
              style="cursor: pointer;"
              @click="clicked(index)"
              @mouseover="mLeave ? null : mouseover(index)"
            ></path>
          </g>
          <g pointer-events="none" text-anchor="middle" :transform="translate">
            <text
              v-for="(text, index) in texts"
              :id="`text`+index"
              :transform="text.transform"
              dy="0.35em"
            >{{text.display ? text.name : null}}</text>
          </g>
        </svg>
      </div>
      <div id="sidebar">
        <input type="checkbox" id="togglelegend"> Legend
        <br>
        <div id="legend" style>
          <svg width="75" height="198">
            <g transform="translate(0,0)">
              <rect rx="3" ry="3" width="75" height="30" style="fill: rgb(86, 135, 209);"></rect>
              <text x="37.5" y="15" dy="0.35em" text-anchor="middle">home</text>
            </g>
            <g transform="translate(0,33)">
              <rect rx="3" ry="3" width="75" height="30" style="fill: rgb(123, 97, 92);"></rect>
              <text x="37.5" y="15" dy="0.35em" text-anchor="middle">product</text>
            </g>
            <g transform="translate(0,66)">
              <rect rx="3" ry="3" width="75" height="30" style="fill: rgb(222, 120, 59);"></rect>
              <text x="37.5" y="15" dy="0.35em" text-anchor="middle">search</text>
            </g>
            <g transform="translate(0,99)">
              <rect rx="3" ry="3" width="75" height="30" style="fill: rgb(106, 185, 117);"></rect>
              <text x="37.5" y="15" dy="0.35em" text-anchor="middle">account</text>
            </g>
            <g transform="translate(0,132)">
              <rect rx="3" ry="3" width="75" height="30" style="fill: rgb(161, 115, 209);"></rect>
              <text x="37.5" y="15" dy="0.35em" text-anchor="middle">other</text>
            </g>
            <g transform="translate(0,165)">
              <rect rx="3" ry="3" width="75" height="30" style="fill: rgb(187, 187, 187);"></rect>
              <text x="37.5" y="15" dy="0.35em" text-anchor="middle">end</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
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
  name: "ChartDonut",
  props: {
    dataDonut: Object,
    width: {
      type: Number,
      default: 932
    },
    display: {
      type: Object,
      default: {
        nbRing: "all",
        text: true,
        zoomable: true,
        hover: true,
        legend: false
      }
    }
  },
  data: function() {
    let color = scaleOrdinal(
      quantize(interpolateRainbow, this.dataDonut.children.length + 1)
    );

    return {
      targetIndex: 0,
      colorScale: color,
      tweenedCoord: [],
      targetCoords: [],
      mLeave: false,
      sequences: {
        colorName: null,
        seqNames: [],
        translatePolygon: []
      }
    };
  },
  computed: {
    root: function() {
      let root = hierarchy(this.dataDonut)
        .sum(d => {
          // console.log(typeof(d.value + 0), parseInt(d.value))
          return d.value;
        })
        .sort((a, b) => b.value - a.value);

      this.partition(root);
      // console.log("root",root.descendants())

      function searchMaxDepth(p) {
        let maxDepth = 0;
        p.each(elem => {
          if (elem.children)
            elem.children.forEach(child => {
              searchMaxDepth(child);
            });
          maxDepth = elem.depth;
        });
        return maxDepth;
      }

      let i = -1;
      root.each(d => {
        ++i;
        return (d.position = i);
      });

      if (this.targetIndex) {
        // console.log("je passe la")
        let p = root.descendants()[this.targetIndex];
        let maxDepth = searchMaxDepth(p);
        let newPartY = (this.radius - 30) / (maxDepth - p.depth + 1);
        let r0Scale = scaleLinear();
        let r1Scale = scaleLinear();

        r0Scale.range([30, this.radius - newPartY]).domain([p.depth, maxDepth]);
        r1Scale.range([newPartY + 30, this.radius]).domain([p.depth, maxDepth]);
        // console.log(newPartY, p.depth, maxDepth);
        root.each(d => {
          let newX0 =
              Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            newX1 =
              Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            newY0 =
              newX1 - newX0 === 2 * Math.PI && d.data.name !== p.data.name
                ? 0
                : r0Scale(d.depth),
            newY1 =
              newX1 - newX0 === 2 * Math.PI && d.data.name !== p.data.name
                ? 30
                : r1Scale(d.depth);
          // console.log(d.data.name);
          // console.log("y0", r0Scale(d.depth), newY0, "y1", r1Scale(d.depth), newY1, d.depth);
          // console.log("x0", newX0, "x1", newX1, "y0", newY0, "y1", newY1, d.depth);
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
      return this.width / 2;
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

      let amppedSlices = this.root.descendants().map(slice => {
        // console.log(slice)
        if (slice.parent) {
          slice.parentName = lookUpForParentName(slice);
        } else slice.parentName = "";
        slice.current = {
          x0: slice.x0,
          x1: slice.x1,
          y0: slice.y0,
          y1: slice.y1
        };

        return slice;
      });
      this.currentCoords = amppedSlices.map(slice => slice.current);
      if (amppedSlices[0].target) {
        this.targetCoords = amppedSlices.map(elem => elem.target);
      }
      if (this.targetIndex === 0) {
        // console.log("index", this.targetIndex)
        this.targetCoords = this.currentCoords;
      }
      // console.log("get slice")
      return amppedSlices;
    },
    texts: function() {
      let textData = this.root.descendants().map(d => {
        let x0 = d.target ? d.target.x0 : d.x0,
          x1 = d.target ? d.target.x1 : d.x1,
          y0 = d.target ? d.target.y0 : d.y0,
          y1 = d.target ? d.target.y1 : d.y1;
        const x = (((x0 + x1) / 2) * 180) / Math.PI;
        const y = (y0 + y1) / 2;
        let display = ((y0 + y1) / 2) * (x1 - x0) > 10 && y0 !== 0;
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
      return textData;
    },
    translate: function() {
      return `translate(${this.width / 2}, ${this.width / 2})`;
    }
  },
  watch: {
    targetCoords: function(newSet, oldSet) {
      // console.log("target", newSet, oldSet)
      function animate() {
        if (TWEEN.update()) {
          // console.log("here");
          requestAnimationFrame(animate);
        }
      }
      newSet.forEach((elem, i) => {
        new TWEEN.Tween(oldSet.length ? oldSet[i] : this.currentCoords[i])
          .to(elem, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(set => {
            // console.log("set",set)
            const x = (((set.x0 + set.x1) / 2) * 180) / Math.PI;
            const y = (set.y0 + set.y1) / 2;
            select("#slice" + i).attr("d", this.arcSlice(set));
            select("#text" + i).attr(
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
    polygonPoints(sequence) {
      console.log("polygon",this.sequences.translatePolygon)
      let a = sequence.length * 10,
          b = a + 10
      console.log("points", a, b, sequence, sequence.length)
      return "0,0 "+a+",0 "+b+",15 "+a+",30 0,30 10,15"
    },

    clicked(index) {
      this.targetIndex = index;
      this.$emit("onClick", this.root.descendants()[index]);
    },

    mouseover(index) {
      function overParents(slice) {
        if (slice.parent && slice.parent.depth > 0) {
          select("#slice" + slice.parent.position).style("opacity", 1);
          overParents(slice.parent);
        }
      }
      function setSequence(slice) {
        if (slice.parent && slice.parent.depth > 0) {
          a.push(slice.parent.data.name)
          setSequence(slice.parent);
        }
      }

      selectAll("#chart path").style("opacity", 0.3);
      select("#slice" + index).style("opacity", 1);
      overParents(this.root.descendants()[index]);
      this.sequences.colorName = this.root.descendants()[index].parentName

      let a = []
      let b = []
      a.push(this.root.descendants()[index].data.name)
      setSequence(this.root.descendants()[index])
      a = a.reverse()
      let antL = 0
      a.forEach((elem, i) => {
        console.log(elem, i)
        let l = 0;
        if (i !== 0)
          l = antL * 10 + 2 + b[i - 1]
        b.push(l)
        antL = elem.length
        i++
      })
      // console.log("a", a)
      this.sequences.seqNames = a
      // console.log("b", b)
      this.sequences.translatePolygon = b
    },

    mouseleave() {
      this.mLeave = true;
      const turnOnHover = () => {
        this.mLeave = false;
        this.sequences.seqNames = []
      };

      selectAll("#chart path")
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
text {
  font: 10px sans-serif;
}
#chart {
  display: flex;
}
</style>