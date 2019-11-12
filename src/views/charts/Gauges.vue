<template>
    <div class="chart">
        <a @click="refreshData">Refresh Data</a> |
        <a @click="refreshSize">Refresh Size</a>
        <CharttGauge v-bind="chartOptions" />
    </div>
</template>
<script>
import { points } from '@/modules/randomVals.js'

import CharttGauge from '@/components/Charts/ChartGauges.vue'


export default {
    name: 'gauges',
    components: {
        CharttGauge
    },
    data: function() {
        return {
            chartOptions: {
                data: points(3, 10, 90),
                width: 720,
                height: 480,
                bandWidth: function(point, pointIndex) {
                    if (!pointIndex) {
                        return 30
                    } else return 30;
                },
                innerRadius: function(point, pointIndex, radius) {
                    if (pointIndex == 0) {
                        return radius - 30;
                    } else {
                        return (radius - 30) - (pointIndex * 10)
                    }
                },
                outerRadius: function(point, pointIndex, radius) {
                    if (pointIndex == 0) {
                        return radius;
                    } else {
                        return (radius - 30 - ((pointIndex - 1) * 10))
                    }
                },
                cornerRadius: 100000000
            }
        }
    },
    methods: {
        refreshData: function() {
            this.chartOptions.data = points(5, 10, 90);
        },
        refreshSize: function() {
            this.chartOptions.width = Math.round(Math.random() * 420 + 300);
            this.chartOptions.height = Math.round(Math.random() * 180 + 300);
        }
    }
}
</script>