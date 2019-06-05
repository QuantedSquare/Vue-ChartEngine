<template>
    <v-container fill-height>
        <VuetifyVizPlayer :charts="charts" />
    </v-container>
</template>
<script>
import { points, collection } from '@/modules/randomVals.js'

import VuetifyVizPlayer from '@/components/VuetifyVizPlayer.vue'


export default {
    name: 'bars',
    components: {
        VuetifyVizPlayer
    },
    data: function() {
        let randomData = collection();

        let chartList = [{
            title: 'Here is a Big Number',
            subTitle: 'Nothing much to say about it',
            chartType: 'chart-number',
            data: Math.round(Math.random() * 10000),
            techTitle: 'Random numbers on Y by random numbers on X'
        }, {
            title: 'Here is a collection of lines',
            subTitle: 'Nothing much to say about them',
            chartType: 'chart-lines',
            data: randomData,
            techTitle: 'Random numbers on Y by random numbers on X'
        }];

        randomData.forEach((line, i) => {
            chartList.push({
                title: 'The points of line ' + (i + 1) + ' in bars',
                chartType: 'chart-bars',
                data: line.points,
                techTitle: 'Random numbers on Y by random numbers on X'
            });
        });

        return {
            charts: chartList
        }
    }
}
</script>