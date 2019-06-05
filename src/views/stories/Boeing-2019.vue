<template>
    <v-container fill-height>
        <VuetifyVizPlayer :charts="charts" />
    </v-container>
</template>
<script>
import { points, collection } from '@/modules/randomVals.js'

import VuetifyVizPlayer from '@/components/VuetifyVizPlayer.vue'

import BoeingLine from '@/assets/data/Boeing-2019.json'
import AirbusLine from '@/assets/data/Airbus-2019.json'

let startValBoeing = +BoeingLine[BoeingLine.length - 1].y;
let startValAirbus = +AirbusLine[BoeingLine.length - 1].y;

export default {
    name: 'bars',
    components: {
        VuetifyVizPlayer
    },
    data: function() {
        let randomData = collection();

        let chartList = [{
                title: 'Following the Boeing 737 Max groundings Boeing Co shares value droped by 23% in 2 months.',
                subTitle: 'Going from 440 the 1st March to 338 the 3rd June',
                chartType: 'chart-number',
                data: 338,
                options: {
                    start: 440,
                    animationTime: 5000
                },
                techTitle: 'Boeing Co share value in USD the 3rd of June'
            },
            {
                title: 'Here is a collection of lines',
                subTitle: 'Nothing much to say about them',
                chartType: 'chart-lines',
                data: [{
                        label: 'Boeing Co',
                        points: BoeingLine.map(p => ({ x: new Date(p.x), y: +p.y }))
                        // points: BoeingLine.map((p, i) => ({ x: new Date(p.x), y: (+p.y / startValBoeing) - 1 }))
                    },
                    {
                        label: 'Airbus',
                        points: AirbusLine.map(p => ({ x: new Date(p.x), y: +p.y }))
                        // points: AirbusLine.map((p, i) => ({ x: new Date(p.x), y: (+p.y / startValAirbus) - 1 }))
                    }
                ],
                options: {
                    isTime: true,
                    curve: 'curveBasis',
                    events: [
                        { x: new Date('October 29, 2018'), label: 'First crash' },
                        { x: new Date('March 10, 2019'), label: 'Second crash' },
                        // { x: new Date('March 13, 2019'), label: 'Groundings' }
                    ]
                },
                techTitle: 'Random numbers on Y by random numbers on X'
            },
            {
                title: 'The points of line in bars',
                subTitle: 'Nothing much to say about them',
                chartType: 'chart-bars',
                data: [
                    { label: '248.72', x: 'Boeing Mar 1, 2019', y: 248.72 },
                    { label: '190.67', x: 'Boeing Jun 3, 2019', y: 190.67 },
                    // {label: '248.72', x: 'Boeing Mar 1, 2019', y: 248.72}
                    // {label: '248.72', x: 'Boeing Mar 1, 2019', y: 248.72}

                ],
                techTitle: 'Random numbers on Y by random numbers on X'
            }
        ];

        return {
            charts: chartList
        }
    }
}
</script>