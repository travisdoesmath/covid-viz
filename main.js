
// Initialize div heights (to be over-written once data is retreived)
let stateContainer = document.querySelector('#state-chart-container')
let lineChartContainer = document.querySelector('#line-chart-container');
let barChartContainer = document.querySelector('#bar-chart-container');

stateContainer.style.height = `${stateContainer.offsetWidth * 0.75}px`;
lineChartContainer.style.height = `${lineChartContainer.offsetWidth * 0.5}px`;
barChartContainer.style.height = `${Math.max(document.documentElement.clientHeight * 0.85, barChartContainer.offsetWidth*0.7)}px`;

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
    // {'cause':'Chronic liver disease and cirrhosis', 'count':41743 },
    // {'cause':'Septicemia', 'count':40922 },
    // {'cause':'Essential hypertension and hypertensive renal disease', 'count':35316 },
    // {'cause':'Parkinson disease', 'count':31963 },
    // {'cause':'Pneumonitis due to solids and liquids', 'count':20108 }
]


function generateWeeklyData(x) {
    return [0,1,2,3,4,5,6].map(d => { return {'label':-1, 'count':x/7, 'offset':d*x/7}})
}

function generateMonthlyData(x) {
    return Array.from(Array(30).keys()).map(d => { return {'label':-1, 'count':x/30, 'offset':d*x/30}})
}

leadingCausesMonthly = leadingCauses.map(x => { return {'cause':x.cause, 'count':x.count/12, 'data':generateMonthlyData(x.count/12)}; })
leadingCausesWeekly = leadingCauses.map(x => { return {'cause':x.cause, 'count':x.count/52, 'data':generateWeeklyData(x.count/52)}; })
leadingCausesDaily = leadingCauses.map(x => { return {'cause':x.cause, 'count':x.count/365}; })

let dateParse = d3.timeParse('%Y%m%d'),
    dateFormat = d3.timeFormat('%b %d')

var globalData;

function dateDiff(date1, date2) {
    let diff = dateParse(date1) - dateParse(date2);
    return Math.round(diff/(24*60*60*1000));
}

var color;

var urls = [
    'https://api.covidtracking.com/v1/us/daily.json',
    'https://api.covidtracking.com/v1/us/current.json',
    'https://api.covidtracking.com/v1/states/daily.json'
    ],
    promises = [];



urls.forEach(url => promises.push(d3.json(url)))

Promise.all(promises).then(function(values) {

    dailyData = values[0].filter(d => d.date >= 20200301)
    currentData = values[1];
    dailyStateData = values[2].filter(d => d.date >= 20200301);

    // console.log(dailyData);
    
    dailyData = dailyData.map(x => { 
        return {'date': x.date, 
                'parsedDate': dateParse(x.date),
                'week': Math.floor((dateParse(x.date) - dateParse(20200229))/(7*24*60*60*1000)),
                'month': +String(x.date).slice(4,6) + 12 * (+String(x.date).slice(0,4) - 2020),
                'day': +String(x.date).slice(6,8),
                'weekday': Math.floor((dateParse(x.date) - dateParse(20200229))/(24*60*60*1000)) % 7,
                'label': dateFormat(dateParse(x.date)),
                'count': x.deathIncrease,
                'totalDeaths': x.death,
                'deathIncrease': x.deathIncrease
                }; 
    }).sort((a, b) => a.date - b.date)


    console.log('dailyData', dailyData)

    // weeklyDataObj = {};
    monthlyDataObj = {};

    dailyData.forEach(item => {
        // collection = weeklyDataObj[item.week];
        // if (!collection) {
        //     weeklyDataObj[item.week] = [item];
        // } else {
        //     collection.push(item)
        // }
        collection = monthlyDataObj[item.month]
        if (!collection) {
            monthlyDataObj[item.month] = [item];
        } else {
            collection.push(item)
        }
    })

    stateDataObj = {};
    dailyStateData.forEach(item => {
        collection = stateDataObj[item.state];
        newItem = {
            state:item.state,
            deaths:item.deathIncrease,
            date:dateParse(item.date)
        }
        if (!collection) {
            stateDataObj[item.state] = [newItem];
        } else {
            collection.push(newItem);
        }
    })

    // weeklyData = Object.keys(weeklyDataObj).map(key => { 
    //     extentDates = d3.extent(weeklyDataObj[key], d => d.date);
    //     minDate = dateFormat(dateParse(extentDates[0]));
    //     maxDate = dateFormat(dateParse(extentDates[1]));
    //     return {
    //         cause: `COVID-19 (${minDate}-${maxDate})`, 
    //         week:key, 
    //         data:weeklyDataObj[key]
    //     };
    // }).sort((a, b) => +a.week - +b.week)

    console.log('monthlyDataObj', monthlyDataObj)

    monthlyData = Object.keys(monthlyDataObj).map(key => {
        extentDates = d3.extent(monthlyDataObj[key], d => d.date);
        minDate = dateFormat(dateParse(extentDates[0]));
        maxDate = dateFormat(dateParse(extentDates[1]));
        return {
            cause: `COVID-19 (${minDate}-${maxDate})`, 
            month:key, 
            data:monthlyDataObj[key]
        };
    }).sort((a, b) => +a.month - +b.month)

    maxDailyDeaths = d3.max(dailyData, x => +x.totalDeaths)
    currentNewDeaths = +currentData[0].death - maxDailyDeaths;
    
    if (currentNewDeaths > 0) {
        // maxWeek = d3.max(weeklyData, d => +d.week)
        maxMonth = d3.max(monthlyData, d => +d.month)
        // maxDay = d3.max(weeklyData[weeklyData.length - 1].data, d => +d.weekday)
        maxDay = d3.max(monthlyData[monthlyData.length - 1].data, d => +d.day)
        // weeklyData[weeklyData.length - 1].data.push({week:maxWeek, weekday:maxDay+1, label:'Current*', count:currentNewDeaths})
        monthlyData[monthlyData.length - 1].data.push({month:maxMonth, day:maxDay+1, label:'Current*', count:currentNewDeaths})
    }

    // weeklyData.forEach(week => {
    //     let count = 0;
    //     week.data.sort((a, b) => a.weekday - b.weekday).forEach(day => {
    //         day.offset = count;
    //         count += day.count;
    //     })
    //     week.count = count;
    // })

    monthlyData.forEach(month => {
        let count = 0;
        month.data.sort((a, b) => a.day - b.day).forEach(day => {
            day.offset = count;
            count += day.count;
        })
        month.count = count;
    })

    test = [1,2,3,4,5].map(d => { return {'key':""+d, value:d}})
    test.map((sum => val => sum += val.value)(0))

    // labels = weeklyData.map(item => item.data.map(x => x.label)).flat()
    labels = monthlyData.map(item => item.data.map(x => x.label)).flat()

    console.log('monthly data: ', monthlyData)

    color = d3.scaleOrdinal(labels, labels.map((d, i) => d3.interpolateReds(i / (labels.length - 1)))).unknown('#DDDDDD')

    // data = weeklyData.concat(leadingCausesWeekly).sort((a, b) => b.count - a.count)
    data = monthlyData.concat(leadingCausesMonthly).sort((a, b) => b.count - a.count)

    stateRegions = {
        'MT': 'West', 
        'ID': 'West', 
        'WY': 'West', 
        'CO': 'West', 
        'NM': 'West', 
        'AZ': 'West', 
        'UT': 'West', 
        'NV': 'West', 
        'CA': 'West', 
        'OR': 'West', 
        'WA': 'West',
        'AK': 'West',
        'HI': 'West', 

        'DE': 'South', 
        'MD': 'South', 
        'VA': 'South', 
        'WV': 'South', 
        'KY': 'South', 
        'NC': 'South', 
        'SC': 'South', 
        'TN': 'South', 
        'GA': 'South', 
        'FL': 'South', 
        'AL': 'South', 
        'MS': 'South', 
        'AR': 'South', 
        'LA': 'South', 
        'TX': 'South',
        'OK': 'South',
        'DC': 'South',

        'OH': 'Midwest',
        'MI': 'Midwest',
        'IN': 'Midwest', 
        'WI': 'Midwest', 
        'IL': 'Midwest', 
        'MN': 'Midwest', 
        'IA': 'Midwest', 
        'MO': 'Midwest', 
        'ND': 'Midwest', 
        'SD': 'Midwest', 
        'NE': 'Midwest', 
        'KS': 'Midwest',

        'ME':'Northeast', 
        'NH':'Northeast', 
        'VT':'Northeast', 
        'MA':'Northeast', 
        'RI':'Northeast', 
        'CT':'Northeast', 
        'NY':'Northeast', 
        'NJ':'Northeast', 
        'PA':'Northeast',
    }

    regionColor = {
        // West: {high:'#f0c30e', low:'#c78800'},
        // South: {high:'#00e800', low:'#36b536'},
        // Midwest: {high:'#42b6f5', low:'#007ec2'},
        // Northeast: {high:'#b62fc2', low:'#a317b0'}
        West: {high:'#917f36', low:'#825b08'},
        South: {high:'#3c783c', low:'#234723'},
        Midwest: {high:'#3c84ab', low:'#007ec2'},
        Northeast: {high:'#a62b2b', low:'#691010'}
    }

    stateColors = {
        'AK': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(0/12), 
        'HI': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(1/12), 
        'WA': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(2/12),
        'OR': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(3/12),
        'ID': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(4/12), 
        'CA': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(5/12), 
        'NV': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(6/12),
        'MT': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(7/12), 
        'UT': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(8/12), 
        'WY': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(9/12), 
        'AZ': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(10/12),
        'CO': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(11/12), 
        'NM': d3.interpolate(d3.color(regionColor.West.high), d3.color(regionColor.West.low))(12/12),

        'ND': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(0/11), 
        'SD': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(1/11), 
        'MN': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(2/11), 
        'NE': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(3/11), 
        'IA': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(4/11), 
        'WI': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(5/11), 
        'KS': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(6/11),
        'MO': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(7/11), 
        'IL': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(8/11), 
        'MI': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(9/11),
        'IN': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(10/11), 
        'OH': d3.interpolate(d3.color(regionColor.Midwest.high), d3.color(regionColor.Midwest.low))(11/11), 

        'OK': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(0/16),
        'AR': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(1/16), 
        'KY': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(2/16), 
        'TX': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(3/16),
        'LA': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(4/16), 
        'MS': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(5/16), 
        'WV': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(6/16), 
        'AL': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(7/16), 
        'TN': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(8/16), 
        'VA': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(9/16), 
        'GA': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(10/16), 
        'NC': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(11/16), 
        'MD': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(12/16), 
        'SC': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(13/16), 
        'DC': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(14/16), 
        'DE': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(15/16), 
        'FL': d3.interpolate(d3.color(regionColor.South.high), d3.color(regionColor.South.low))(16/16), 

        'PA': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(0/8),
        'NY': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(1/8),
        'CT': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(2/8),
        'NJ': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(3/8),
        'RI': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(4/8),
        'VT': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(5/8),
        'MA': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(6/8),
        'NH': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(7/8),
        'ME': d3.interpolate(d3.color(regionColor.Northeast.high), d3.color(regionColor.Northeast.low))(8/8),
    }

    function stateColor(state) {
        return stateColors[state] ? stateColors[state] : '#888';
    }



    const lineChart = new LineChart({
        element: document.querySelector('#line-chart-container'),
        data: dailyData,
        gridData: leadingCausesDaily,
        x: d => d.parsedDate,
        y: d => d.deathIncrease,
        tooltipY: [d => d.count, d => dateFormat(d.parsedDate)],
        gridY: d => d.count,
        gridLabel: d => d.cause
    })

    const barChart = new BarChart({
        element: document.querySelector('#bar-chart-container'),
        data: data,
        color: color,
        x: d => d.count,
        y: d => d.cause
    })

    console.log('stateDataObj', stateDataObj)





    const areaChart = new AreaChart({
        element: document.querySelector('#area-chart-container'),
        //data: Object.keys(stateDataObj).map(state => { return {'key': state, 'values': stateDataObj[state]}; }),
        data: dailyStateData,
        x: d => d.date,
        y: d => d.death,
        color: stateColor
    })

    const stateLayout = new StateLayout({
        element: document.querySelector('#state-chart-container'),
        data: stateDataObj,
        x: d => d.date,
        y: d => d.deaths,
        color: stateColor        
    })


})
