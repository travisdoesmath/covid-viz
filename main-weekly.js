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
    return [0,1,2,3,4,5,6].map(d => { return {'label':-1, 'count':x/7, 'offset':d*x/7}})
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

var urls = [
    'https://covidtracking.com/api/v1/us/daily.json',
    'https://covidtracking.com/api/v1/us/current.json'
    ],
    promises = [];

urls.forEach(url => promises.push(d3.json(url)))

Promise.all(promises).then(function(values) {

    dailyData = values[0].filter(d => d.date > 20200314)
    currentData = values[1];
    
    console.log(values[0]);


    dailyData = dailyData.map(x => { 
        return {'date': x.date, 
                'week': Math.floor((dateParse(x.date) - dateParse(20200229))/(7*24*60*60*1000)),
                'weekday': Math.floor((dateParse(x.date) - dateParse(20200229))/(24*60*60*1000)) % 7,
                'label': dateFormat(dateParse(x.date)),
                'count': x.deathIncrease,
                'totalDeaths': x.death
                }; 
    }).sort((a, b) => a.date - b.date)

    weeklyDataObj = {};
    dailyData.forEach(item => {
        collection = weeklyDataObj[item.week];
        if (!collection) {
            weeklyDataObj[item.week] = [item];
        } else {
            collection.push(item)
        }
    })

    weeklyData = Object.keys(weeklyDataObj).map(key => { 
        extentDates = d3.extent(weeklyDataObj[key], d => d.date);
        minDate = dateFormat(dateParse(extentDates[0]));
        maxDate = dateFormat(dateParse(extentDates[1]));
        return {
            cause: `COVID-19 (${minDate}-${maxDate})`, 
            week:key, 
            data:weeklyDataObj[key]
        };
    }).sort((a, b) => +a.week - +b.week)

    maxDailyDeaths = d3.max(dailyData, x => +x.totalDeaths)
    currentNewDeaths = +currentData[0].death - maxDailyDeaths;
    console.log(currentNewDeaths)

    if (currentNewDeaths > 0) {
        maxWeek = d3.max(weeklyData, d => +d.week)
        maxDay = d3.max(weeklyData[weeklyData.length - 1].data, d => +d.weekday)
        weeklyData[weeklyData.length - 1].data.push({week:maxWeek, weekday:maxDay+1, label:'Current*', count:currentNewDeaths})
    }

    weeklyData.forEach(week => {
        let count = 0;
        week.data.sort((a, b) => a.weekday - b.weekday).forEach(day => {
            day.offset = count;
            count += day.count;
        })
        week.count = count;
    })


    test = [1,2,3,4,5].map(d => { return {'key':""+d, value:d}})
    test.map((sum => val => sum += val.value)(0))

    labels = weeklyData.map(item => item.data.map(x => x.label)).flat()

    color = d3.scaleOrdinal(labels, labels.map((d, i) => d3.interpolateReds(i / (labels.length - 1)))).unknown('#DDDDDD')

    data = weeklyData.concat(leadingCausesWeekly).sort((a, b) => b.count - a.count)
    console.log(data);

    const chart = new BarChart({
        element: document.querySelector('.chart-container'),
        data: data,
        color: color,
        x: d => d.count,
        y: d => d.cause
    })
})
