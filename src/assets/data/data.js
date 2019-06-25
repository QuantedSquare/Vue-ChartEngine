[{
        title: 'Following the Boeing 737 Max groundings Boeing Co shares value droped by 23% in 2 months.',
        subTitle: 'Going from 440 USD the 1st March to 338 USD the 3rd June',
        chartType: 'chart-number',
        data: 338,
        options: {
            start: 440,
            animationTime: 5000
        },
        techTitle: 'Boeing Co share value in USD Jun 03, 2019'
    },
    {
        title: 'Boeing Co share value shows high volatility compared to Airbus',
        subTitle: '',
        chartType: 'chart-lines',
        data: [{
                label: 'Boeing Co',
                points: sortedBoeing
                // points: BoeingLine.map((p, i) => ({ x: new Date(p.x), y: (+p.y / startValBoeing) - 1 }))
            },
            {
                label: 'Airbus',
                points: sortedAirbus
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
            ],
            min: 0,
            max: 500
        },
        techTitle: 'Share price in USD per day from Jun 06, 2018 to Jun 05, 2019'
    },
    {
        title: 'The Boeing 737 Max groundings had no positive impact on Airbus Market Cap',
        subTitle: 'Is there an opportunity for Airbus to grow from this event ?',
        chartType: 'chart-bars',
        data: [
            { label: '248.72B', x: 'Boeing Mar 1, 2019', y: 248.72 },
            { label: '190.67B', x: 'Boeing Jun 3, 2019', y: 190.67 },
            { label: '100.57B', x: 'Airbus Mar 1, 2019', y: 100.57 },
            { label: '101.23B', x: 'Airbus Jun 3, 2019', y: 101.23 }

        ],
        options: { min: 0, max: 300 },
        techTitle: 'Market Cap in USD'
    }
];