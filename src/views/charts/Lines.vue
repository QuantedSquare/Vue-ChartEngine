<template>
    <div class="chart">
        <a @click="refreshData">Refresh Lines</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartLines v-bind="chartOptions" :yAxis="false" :pointsLabels="true" :colors="optionalColors" :coloredLabels="true" />
        <ChartLines v-bind="chartOptions">
            <template v-slot:top="chartData">
                <line v-for="x in nbPoints" :x1="chartData.$data.xScale(x-1)" :x2="chartData.$data.xScale(x-1)" :y1="chartData.$data.yScale(chartData._yMin)" :y2="chartData.$data.yScale(chartData._yMax)" stroke="black"></line>
            </template>
        </ChartLines>
    </div>
</template>
<script>
import { collection } from '@/modules/randomVals.js'

import ChartLines from '@/components/Charts/ChartLines'


export default {
    name: 'lines',
    components: {
        ChartLines
    },
    data: function() {
        let nbLines = Math.round(Math.random() * 2 + 2);
        let nbPoints = Math.round(Math.random() * 15 + 3);

        return {
            chartOptions: {
                data: collection(nbLines, nbPoints, 0, 100),
                curve: 'curveMonotoneX',
                events: [{
                    x: 3,
                    label: 'An Event on 3'
                }],
                isTime: false,
                xMin: -5,
                xTickFormat: (p, t) => p ? p.label : t,
                width: 720,
                height: 480,
                dots: true,
                linesLabels: true
            },
            nbPoints: nbPoints,
            optionalColors: [
                'rgb(241, 70, 35)', 'rgb(69, 219, 255)',
                'rgb(81, 99, 101)'
            ]
        }
    },
    methods: {
        refreshData: function() {
            let nbLines = Math.round(Math.random() * 2 + 2);
            let nbPoints = Math.round(Math.random() * 15 + 3)

            // this.chartOptions.isTime = true;
            delete this.chartOptions.xMin
            this.chartOptions.data = collection(nbLines, nbPoints, 0, 100);

            this.chartOptions.events = [{
                x: 4,
                label: 'An Event on 4'
            }, {
                x: 2,
                label: 'An Event on 2'
            }]
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>