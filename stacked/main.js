let dateParse = d3.timeParse('%Y%m%d'),
    dateFormat = d3.timeFormat('%b %d')

var globalData;

var urls = [
    'https://covidtracking.com/api/v1/states/daily.json'
    ],
    promises = [];

urls.forEach(url => promises.push(d3.json(url)))

var test;

function stateToRegion(st, level = 2) {
    if (level === 1) {
        if (['CT','ME','MA','NH','RI','VT','NJ','NY','PA'].indexOf(st) !== -1) {
            return 'Northeast';
        } else if (['IL','IN','MI','OH','WI','IA','KS','MN','MO','NE','ND','SD'].indexOf(st) !== -1) {
            return 'Midwest';
        } else if (['DE','FL','GA','MD','NC','SC','VA','DC','WV','AL','KY','MS','TN','AR','LA','OK','TX'].indexOf(st) !== -1) {
            return 'South';
        } else if (['AZ','CO','ID','MT','NV','NM','UT','WY','AK','CA','HI','OR','WA'].indexOf(st) !== -1) {
            return 'West';
        } else {
            return 'Other';
        }
    } else if (level === 2) {
        if (['CT','ME','MA','NH','RI','VT'].indexOf(st) !== -1) {
            return 'New England';
        } else if (['NJ','NY','PA'].indexOf(st) !== -1) {
            return 'Mid-Atlantic';
        } else if (['IL','IN','MI','OH','WI'].indexOf(st) !== -1) {
            return 'East North Central';
        } else if (['IA','KS','MN','MO','NE','ND','SD'].indexOf(st) !== -1) {
            return 'West North Central';
        } else if (['DE','FL','GA','MD','NC','SC','VA','DC','WV'].indexOf(st) !== -1) {
            return 'South Atlantic';
        } else if (['AL','KY','MS','TN'].indexOf(st) !== -1) {
            return 'East South Central';
        } else if (['AR','LA','OK','TX'].indexOf(st) !== -1) {
            return 'West South Central';
        } else if (['AZ','CO','ID','MT','NV','NM','UT','WY'].indexOf(st) !== -1) {
            return 'Mountain';
        } else if (['AK','CA','HI','OR','WA'].indexOf(st) !== -1) {
            return 'Pacific';
        } else {
            return 'Other';
        }
    }
}

Promise.all(promises).then(function(values) {
    test = values[0];

    var level = 1;

    states = [...new Set(values[0].slice().sort((a, b) => a.death - b.death).map(x => x.state))]
    regions = [...new Set(states.map(st => stateToRegion(st, level)))]


    dataObj = {};

    values[0].forEach(d => d.region = stateToRegion(d.state, level))

    // values[0].forEach(d => {
    //     if (dataObj[d.date]) {
    //         d.death ? dataObj[d.date][d.state] += d.death : null;
    //     } else {
    //         dataObj[d.date] = {};
    //         states.forEach(s => dataObj[d.date][s] = 0)
    //     }
    // })

    values[0].forEach(d => {
        if (dataObj[d.date]) {
            d.death ? dataObj[d.date][d.region] += d.death : null;
        } else {
            dataObj[d.date] = {};
            regions.forEach(s => dataObj[d.date][s] = 0)
        }
    })


    data = Object.keys(dataObj).map(k => { _ = dataObj[k]; _['date'] = dateParse(k); return _; })

    color = d3.scaleOrdinal()
        .domain(regions)
        .range(d3.schemeBlues[regions.length])


    chart = new AreaChart({
        element: document.querySelector('.chart-container'),
        data: data,
        stackKeys: regions,
        color: color,
        x: d => d.date
    })
});
