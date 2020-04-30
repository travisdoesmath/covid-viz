leadingCauses = [
    {'cause':'Heart disease', 'count':647457 / 365}, 
    {'cause':'Cancer', 'count':599108 / 365},
    {'cause':'Accidents (unintentional injuries)', 'count':169936 / 365},
    {'cause':'Chronic lower respiratory diseases', 'count':160201 / 365},
    {'cause':'Stroke', 'count':146383 / 365},
    {'cause':"Alzheimer disease", 'count':121404 / 365},
    {'cause':'Diabetes', 'count':83564 / 365},
    {'cause':'Influenza and pneumonia', 'count':55672 / 365},
    {'cause':'Nephritis, nephrotic syndrome and nephrosis', 'count':50633 / 365},
    {'cause':'Intentional self-harm (suicide)', 'count':47173 / 365}
]

let dateParse = d3.timeParse('%Y%m%d'),
    dateFormat = d3.timeFormat('%b %d')

var globalData;

var urls = [
    'https://covidtracking.com/api/v1/us/daily.json',
    'https://covidtracking.com/api/v1/us/current.json'
    ],
    promises = [];

urls.forEach(url => promises.push(d3.json(url)))

Promise.all(promises).then(function(values) {

    console.log(values);

    dailyData = values[0].filter(d => d.date > '20200315');
    currentData = values[1];

    dailyData.forEach(d => d.date = dateParse(d.date))

    const chart = new LineChart({
        element: document.querySelector('.chart-container'),
        data: dailyData,
        gridData: leadingCauses,
        x: d => d.date,
        y: d => d.deathIncrease,
        gridY: d => d.count,
        gridLabel: d => d.cause

    })
});
