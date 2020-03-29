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
    {'cause':'Intentional self-harm (suicide)', 'count':47173 / 365},
    {'cause':'Chronic liver disease and cirrhosis', 'count':41743 / 365},
    {'cause':'Septicemia', 'count':40922 / 365},
    {'cause':'Essential hypertension and hypertensive renal disease', 'count':35316 / 365},
    {'cause':'Parkinson disease', 'count':31963 / 365},
    {'cause':'Pneumonitis due to solids and liquids', 'count':20108 / 365}
]

let dateParse = d3.timeParse('%Y%m%d'),
    dateFormat = d3.timeFormat('%b %d')

d3.json('https://covidtracking.com/api/us/daily').then(function(data) {
    covidData = data.sort((a, b) => dateParse(a.date) - dateParse(b.date)).map( x=> { return {'cause':`COVID-19 (${dateFormat(dateParse(x.date))})`, 'count':+x.deathIncrease}; }).filter(x => x.count > 50)

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
