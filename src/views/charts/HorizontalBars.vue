<template>
    <div class="chart">
        <a @click="refreshData">Refresh Bars</a> |
        <a @click="refreshSize">Refresh Size</a>
        <ChartHorizontalBars v-bind="chartOptions" :barsPadding="10" />
        <ChartHorizontalBars v-bind="chartOptions" :yAxis="false" :xAxis="false" :bandHeight="20" :cornerRadius="10" :barsPadding="2" :xScalePadding="0">
            <template v-slot:top="chartData">
                <g v-for="(bar, barIndex) in chartData.renderedBars">
                    <template v-for="point in bar.points">
                        <text v-if="point.y > 0" class="predictive-value-label" :x="chartData.$data.yScale(point.offset) + (chartData.$data.yScale(point.y)/2)" :y="chartData.$data.xScale(barIndex) + 10" text-anchor="middle">{{Math.round(point.y)}}%</text>
                    </template>
                </g>
            </template>
            <template v-slot:default="chartData">
                <template>
                    <text v-for="(bar, barIndex) in chartData.renderedBars" class="predictive-value-label" :x="chartData.$data.yScale(0) -27" :y="chartData.$data.xScale(barIndex) + (chartData.$data.xScale.bandwidth() / 2) + 2.5">{{bar.label}}</text>
                    <line v-for="i in chartData.renderedBars.length +1" class="line-axis" :x1="chartData.$data.yScale(0)-5" :x2="chartData.$data.yScale(0)" :y1="chartData.$data.xScale.step()*(i-1)" :y2="chartData.$data.xScale.step()*(i-1)" stroke="black"></line>
                    <line class="line-axis" :x1="chartData.$data.yScale(0)" :x2="chartData.$data.yScale(0)" :y1="0" :y2="chartData.$data.xScale(chartData.renderedBars.length -1) + chartData.$data.xScale.step()" stroke="black"></line>
                </template>
                <!-- <template>
                    <template v-for="i in [0, 25, 50, 75, 100]">
                        <text class="predictive-value-label" text-anchor="middle" :x="chartData.$data.yScale(i)" :y="chartData.$data.xScale(5) + chartData.$data.xScale.bandwidth() + 15">{{i}}%</text>
                        <line class="line-axis" :x1="chartData.$data.yScale(i)" :x2="chartData.$data.yScale(i)" :y1="chartData.$data.xScale(5) + chartData.$data.xScale.bandwidth()" :y2="chartData.$data.xScale(5) + chartData.$data.xScale.bandwidth() + 5" stroke="black"></line>
                    </template>
                    <line class="line-axis" :x1="chartData.$data.yScale(0)" :x2="chartData.$data.yScale(100)" :y1="chartData.$data.xScale(5) + chartData.$data.xScale.bandwidth()" :y2="chartData.$data.xScale(5) + chartData.$data.xScale.bandwidth()" stroke="black"></line>
                </template> -->
            </template>
        </ChartHorizontalBars>
    </div>
</template>
<script>
import { collection } from '@/modules/randomVals.js'
import { aggregatePoints } from '@/modules/utilities.js'

import ChartHorizontalBars from '@/components/Charts/ChartHorizontalBars.vue'

export default {
    name: 'bars',
    components: {
        ChartHorizontalBars
    },
    data: function() {
        let nbLines = Math.round(Math.random() * 2 + 2);
        let nbPoints = Math.round(Math.random() * 2 + 3);

        return {
            chartOptions: {
                data: collection(nbLines, nbPoints, 0, 100),
                animationTime: 1000,
                min: 0,
                width: 720,
                height: 480
            }
        }
    },
    methods: {
        refreshData: function(min, max) {
            let nbLines = Math.round(Math.random() * 4 + 2);
            let nbPoints = Math.round(Math.random() * 2 + 3);

            this.chartOptions.data = collection(nbLines, nbPoints, 0, 100);
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>