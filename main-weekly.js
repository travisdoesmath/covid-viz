leadingCauses = [
    {'cause':'Heart disease', 'count':647457 }, 
    {'cause':'Cancer', 'count':599108 },
    {'cause':'Accidents (unintentional injuries)', 'count':169936 },
    {'cause':'Chronic lower respiratory diseases', 'count':160201 },
    {'cause':'Stroke', 'count':146383 },
    {'cause':"Alzheimer disease", 'count':121404 },
    {'cause':'Diabetes', 'count':83564 },
    {'cause':'Influenza and pneumonia', 'count':55672 },
    {'cause':'Nephritis, nephrotic syndrome and nephrosis', 'count':50633 },
    {'cause':'Intentional self-harm (suicide)', 'count':47173 },
    {'cause':'Chronic liver disease and cirrhosis', 'count':41743 },
    {'cause':'Septicemia', 'count':40922 },
    {'cause':'Essential hypertension and hypertensive renal disease', 'count':35316 },
    {'cause':'Parkinson disease', 'count':31963 },
    {'cause':'Pneumonitis due to solids and liquids', 'count':20108 }
]

function generateWeeklyData(x) {
    return [0,1,2,3,4,5,6].map(d => { return {'date':-1, 'count':x/7, 'offset':d*x/7}})
}

leadingCausesWeekly = leadingCauses.map(x => { return {'cause':x.cause, 'count':x.count/52, 'data':generateWeeklyData(x.count/52)}; })

let dateParse = d3.timeParse('%Y%m%d'),
    dateFormat = d3.timeFormat('%b %d')

var globalData;

function dateDiff(date1, date2) {
    let diff = dateParse(date1) - dateParse(date2);
    return Math.round(diff/(24*60*60*1000));
}

var color;

d3.json('https://covidtracking.com/api/us/daily').then(function(data) {

    data = data.filter(d => d.date > 20200314)

    function createColorFunction(minDate, maxDate) {
        let color = function(d) {
            if (d == -1) return "#DDDDDD";
            return d3.interpolateReds(dateDiff(d, minDate) / dateDiff(maxDate, minDate));
        }
        return color;
    }

    color = createColorFunction(d3.min(data, d => d.date), d3.max(data, d => d.date))

    globalData = data;
    data.forEach(x => x.week = Math.floor((dateParse(x.date) - dateParse(20200229))/(7*24*60*60*1000)));
    weeklyCovidData = {};
    for (let i = 0; i < data.length; i++) {
        if (weeklyCovidData[data[i].week]) {
            weeklyCovidData[data[i].week].count += data[i].deathIncrease;
            weeklyCovidData[data[i].week].data.push(data[i])
        } else {
            weeklyCovidData[data[i].week] = {'count':data[i].deathIncrease, data:[data[i]]};
        }
    }

    covidData = Object.keys(weeklyCovidData).sort().map(key => { 
        weeklyCovidData[key].week = key;
        weeklyCovidData[key].cause = `COVID-19 (${dateFormat(dateParse(d3.min(weeklyCovidData[key].data, x => x.date)))}-${dateFormat(dateParse(d3.max(weeklyCovidData[key].data, x => x.date)))})`;
        return weeklyCovidData[key];
    })

    for (let i = 0; i < covidData.length; i++) {
        covidWeek = covidData[i];
        cumulativeSum = 0;
        covidWeek.data.sort((a, b) => a.date - b.date)
        for (let j = 0; j < covidWeek.data.length; j++) {
            x = covidWeek.data[j];

            covidWeek.data[j] = {'date':x.date, 'count':x.deathIncrease, 'offset':cumulativeSum};
            cumulativeSum += x.deathIncrease;
            
        }
    }

    data = covidData.concat(leadingCausesWeekly).sort((a, b) => b.count - a.count)
    console.log(data);

    const chart = new BarChart({
        element: document.querySelector('.chart-container'),
        data: data,
        color: color,
        x: d => d.count,
        y: d => d.cause
    })
})
