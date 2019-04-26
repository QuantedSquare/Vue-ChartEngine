<template>
    <div>
        <svg height="1000" width="100%">
            <!-- <g :transform="display">
                <g id="xAxis" :transform="bottomTranslate"></g>
                <g id="yAxis"></g>
                <rect class="bar" v-for="point in bars" :x="xScale(point.x)" :y="_height() - yScale(point.y)" :width="xScale.bandwidth()" :height="yScale(point.y)"></rect>
      </g>-->
            <g fill-opacity="0.6" transform="translate(500, 500)">
                <path v-for="(slice, index) in slices" :key="slice.id" :fill="colorScale(slice.parentName)" :d="arcSlice(slice)" style="cursor: pointer;" @click="clicked(index)"></path>
            </g>
            <g pointer-events="none" text-anchor="middle" transform="translate(500, 500)">
                <text v-for="text in donut.text" :transform="text.transform" dy="0.35em">{{text.display ? text.name : null}}</text>
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
        data: Object,
        width: {
            type: Number,
            default: 932
        }
    },
    data: function() {
        let radius = this.width / 2;

        let arcSlice = arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius / 2)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1 - 1);

        let color = scaleOrdinal(
            quantize(interpolateRainbow, this.data.children.length + 1)
        );

        return {
            donut: {},
            rootDesc: [],
            rootPart: [],
            // radius: radius,
            arcSlice: arcSlice,
            colorScale: color
        };
    },
    created() {
        // var form = format(",d");

        // this.donut.text = root.descendants().map(d => {
        //     const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        //     const y = (d.y0 + d.y1) / 2;
        //     let display = ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10;
        //     let transform = `rotate(${x - 90}) translate(${y},0) rotate(${
        //   x < 180 ? 0 : 180
        // })`;
        //     let name = d.data.name;
        //     return {
        //         display: display,
        //         name: name,
        //         transform: transform
        //     };
        // });
    },
    watch: {
        // radius: function() {
        //     this.arcSlice.padRadius(radius / 2);
        // }
    },
    computed: {
        radius: function() {
            return this.width / 2;
        },
        partition: function() {
            return partition().size([2 * Math.PI, this.radius]);
        },
        slices: function() {
            let root = hierarchy(this.data)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            this.partition(root);

            function lookUpForParentName(slice) {
                if (slice.parent && slice.parent.depth > 0) {
                    return lookUpForParentName(slice.parent);
                } else {
                    return slice.data.name;
                }
            }

            let amppedSlices = root.descendants().map(slice => {
                if (slice.parent) {
                    slice.parentName = lookUpForParentName(slice);
                } else slice.parentName = '';

                return slice;
            });

            return amppedSlices;
        }
    },
    methods: {
        // clicked(index) {
        //     let p = this.rootDesc[index]

        //     // parent.datum(p.parent || root);

        //     this.rootPart.each(
        //         d =>
        //         (d.target = {
        //             x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
        //                 2 *
        //                 Math.PI,
        //             x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
        //                 2 *
        //                 Math.PI,
        //             y0: Math.max(0, d.y0 - p.depth),
        //             y1: Math.max(0, d.y1 - p.depth)
        //         })
        //     );

        //     console.log(this.rootPart)

        //     const t = selectAll('g').transition().duration(750);

        //     // // Transition the data on all arcs, even the ones that aren’t visible,
        //     // // so that if this transition is interrupted, entering arcs will start
        //     // // the next transition from the desired position.
        //     selectAll('path')
        //         .data(this.data)
        //         .transition(t)
        //         .tween("data", d => {
        //             console.log(d)
        //             const i = interpolate(d.current, d.target);
        //             return t => (d.current = i(t));
        //         })
        //         .filter(function(d) {
        //             return +this.getAttribute("fill-opacity") || this.arcVisible(d.target);
        //         })
        //         .attr("fill-opacity", d =>
        //             this.arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        //         )
        //         .attrTween("d", d => () => arc(d.current));

        //     // label
        //     //   .filter(function(d) {
        //     //     return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        //     //   })
        //     //   .transition(t)
        //     //   .attr("fill-opacity", d => +labelVisible(d.target))
        //     //   .attrTween("transform", d => () => labelTransform(d.current));
        // },

        // arcVisible(d) {
        //     return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
        // },

        // labelVisible(d) {
        //     return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        // },

        // labelTransform(d) {
        //     const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        //     const y = ((d.y0 + d.y1) / 2) * radius;
        //     return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        // }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
text {
    font: 10px sans-serif;
}
</style>