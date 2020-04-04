leadingCauses = [
    {'cause':'Heart disease', 'count':647457 / 52}, 
    {'cause':'Cancer', 'count':599108 / 52},
    {'cause':'Accidents (unintentional injuries)', 'count':169936 / 52},
    {'cause':'Chronic lower respiratory diseases', 'count':160201 / 52},
    {'cause':'Stroke', 'count':146383 / 52},
    {'cause':"Alzheimer disease", 'count':121404 / 52},
    {'cause':'Diabetes', 'count':83564 / 52},
    {'cause':'Influenza and pneumonia', 'count':55672 / 52},
    {'cause':'Nephritis, nephrotic syndrome and nephrosis', 'count':50633 / 52},
    {'cause':'Intentional self-harm (suicide)', 'count':47173 / 52},
    {'cause':'Chronic liver disease and cirrhosis', 'count':41743 / 52},
    {'cause':'Septicemia', 'count':40922 / 52},
    {'cause':'Essential hypertension and hypertensive renal disease', 'count':35316 / 52},
    {'cause':'Parkinson disease', 'count':31963 / 52},
    {'cause':'Pneumonitis due to solids and liquids', 'count':20108 / 52}
]

let dateParse = d3.timeParse('%Y%m%d'),
    dateFormat = d3.timeFormat('%b %d')

var globalData;

d3.json('https://covidtracking.com/api/us/daily').then(function(data) {
    globalData = data;
    data.forEach(x => x.week = Math.floor((dateParse(x.date) - dateParse(20200229))/(7*24*60*60*1000)));
    covidData = {};
    for (let i = 0; i < data.length; i++) {
        if (covidData[data[i].week]) {
            covidData[data[i].week].count += data[i].deathIncrease;
            covidData[data[i].week].minDate = Math.min(covidData[data[i].week].minDate, data[i].date)
            covidData[data[i].week].maxDate = Math.max(covidData[data[i].week].maxDate, data[i].date)
        } else {
            covidData[data[i].week] = {'count':data[i].deathIncrease, 'minDate':+data[i].date, 'maxDate':data[i].date};
        }
    }

    covidData = Object.keys(covidData).sort().map(key => {covidData[key].cause = `COVID-19 (${dateFormat(dateParse(covidData[key].minDate))}-${dateFormat(dateParse(covidData[key].maxDate))})`; return covidData[key]})

//    covidData = data.sort((a, b) => dateParse(a.date) - dateParse(b.date)).map( x=> { return {'cause':`COVID-19 (${dateFormat(dateParse(x.date))})`, 'count':+x.deathIncrease}; }).filter(x => x.count > 50)

    let color = function(d) {
        for (let i = 0; i < covidData.length; i++) {
            if (d === covidData[i].cause) return d3.interpolateReds(i/covidData.length);
        }
        return '#DDDDDD';
    }

    data = covidData.concat(leadingCauses).sort((a, b) => b.count - a.count)

    const chart = new BarChart({
        element: document.querySelector('.chart-container'),
        data: data,
        color: color,
        x: d => d.count,
        y: d => d.cause
    })
})
