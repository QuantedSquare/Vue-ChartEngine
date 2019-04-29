<template>
  <div>
    <svg height="1000" width="100%">
      <g fill-opacity="0.6" transform="translate(500, 500)">
        <path
          v-for="(slice, index) in slices"
          :key="slice.id"
          :fill="colorScale(slice.parentName)"
          :d="arcSlice(slice)"
          style="cursor: pointer;"
          @click="clicked(index)"
        ></path>
      </g>
      <g pointer-events="none" text-anchor="middle" transform="translate(500, 500)">
        <text
          v-for="text in texts"
          :transform="text.transform"
          dy="0.35em"
        >{{text.display ? text.name : null}}</text>
      </g>
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
  interpolate
} from "d3";

export default {
  name: "ChartDonut",
  props: {
    dataDonut: Object,
    width: {
      type: Number,
      default: 932
    }
  },
  data: function() {
    let color = scaleOrdinal(
      quantize(interpolateRainbow, this.dataDonut.children.length + 1)
    );

    return {
      // currentDepth: 0,
      targetIndex: 0,
      colorScale: color
    };
  },
  computed: {
    root: function() {
      let root = hierarchy(this.dataDonut)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

      this.partition(root);

      function searchMaxDepth(p) {
        let maxDepth = 0;
        // console.log("p", p);
        p.each(elem => {
          if (elem.children)
            elem.children.forEach(child => {
              searchMaxDepth(child);
            });
          maxDepth = elem.depth;
        });
        return maxDepth;
      }

      if (this.targetIndex) {
        let p = root.descendants()[this.targetIndex];
        // parent.datum(p.parent || root);
        let maxDepth = searchMaxDepth(p);
        let newPartY = (this.radius - 50) / (maxDepth - p.depth + 1);
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
                : newX1 - newX0 === 0
                ? 0
                : d.data.name === p.data.name
                ? 50
                : (d.depth - p.depth) * newPartY,
            newY1 =
              newX1 - newX0 === 2 * Math.PI && d.data.name !== p.data.name
                ? 50
                : newX1 - newX0 === 0
                ? 0
                : d.data.name === p.data.name
                ? newY0 + newPartY - 50
                : newY0 + newPartY;
          console.log(p.data.name, d.data.name, newX0, newX1, newY0, newY1);
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
          return d.target ? d.target.x0 : d.x0;
        })
        .endAngle(d => {
          return d.target ? d.target.x1 : d.x1;
        })
        .padAngle(d => {
          return d.target
            ? Math.min((d.target.x1 - d.target.x0) / 2, 0.005)
            : Math.min((d.x1 - d.x0) / 2, 0.005);
        })
        .padRadius(this.radius / 2)
        .innerRadius(d => {
          return d.target ? d.target.y0 : d.y0;
        })
        .outerRadius(d => {
          return d.target ? d.target.y1 - 1 : d.y1 - 1;
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
        if (slice.parent) {
          slice.parentName = lookUpForParentName(slice);
        } else slice.parentName = "";

        return slice;
      });

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
    }
  },
  watch: {
    root: function(val) {
      console.log("new root", val);
    }
  },
  methods: {
    clicked(index) {
      this.targetIndex = index;
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