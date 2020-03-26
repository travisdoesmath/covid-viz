leadingCauses = [
    {'cause':'Heart Disease', 'count':647457 / 365}, 
    {'cause':'Cancer', 'count':599108 / 365},
    {'cause':'Accidents', 'count':169936 / 365},
    {'cause':'Chronic lower respiratory diseases', 'count':160201 / 365},
    {'cause':'Stroke', 'count':146383 / 365},
    {'cause':"Alzheimer's", 'count':121404 / 365},
    {'cause':'Diabetes', 'count':83564 / 365},
    {'cause':'Influenza and pneumonia', 'count':55672 / 365},
    {'cause':'Nephritis and nephrosis', 'count':50633 / 365},
    {'cause':'Intentional self-harm (suicide)', 'count':47173 / 365},
    {'cause':'Liver Disease', 'count':41743 / 365},
    {'cause':'Septicemia', 'count':40922 / 365},
    {'cause':'Hypertension', 'count':35316 / 365},
    {'cause':'Parkinson disease', 'count':31963 / 365},
    {'cause':'Pneumonitis', 'count':20108 / 365}
]


let dateParse = d3.timeParse('%Y-%m-%d'),
    dateFormat = d3.timeFormat('%b %d')

d3.csv('covid-deaths.csv').then(function(data) {
    covidData = data.sort((a, b) => dateParse(a.Date) - dateParse(b.Date)).map(x => { return {'cause':`COVID-19 (${dateFormat(dateParse(x.Date))})`, 'count':+x.New}; }).filter(x => x.count > 50)

    let color = function(d) {
        for (let i = 0; i < covidData.length; i++) {
            if (d === covidData[i].cause) return d3.schemeReds[covidData.length][i];
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

class BarChart {

    x = d => d.x;
    y = d => d.y;

    constructor(opts) {
        this.data = opts.data;
        this.element = opts.element;
        this.color = opts.color;

        if(opts.x) this.x = opts.x;
        if(opts.y) this.y = opts.y;

        this.draw();
    }

    draw() {
        this.width = this.element.offsetWidth;
        this.height = this.width / 2;
        this.margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 170
        };

        this.element.innerHTML = '';
        const svg = d3.select(this.element).append('svg');
        svg.attr('width', this.width);
        svg.attr('height', this.height);

        this.plot = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.createScales();
        this.addBars();
        this.addAxes();
    }

    createScales() {
        const xMax = d3.max(this.data, this.x);

        this.xScale = d3.scaleLinear()
            .range([0, this.width - this.margin.right - this.margin.left])
            .domain([0, xMax])
            .nice()

        this.yScale = d3.scaleBand()
            .range([this.margin.bottom, this.height - this.margin.top - this.margin.bottom])
            .domain(this.data.map(d => this.y(d)))
            .padding(0.1);
    }

    addAxes() {
        const xAxis = d3.axisBottom()
            .scale(this.xScale)

        const yAxis = d3.axisLeft()
            .scale(this.yScale)

        this.plot.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.height - (this.margin.top + this.margin.bottom)})`)
            .call(xAxis)

        this.plot.append("g")
            .attr("class", "y axis")
            .call(yAxis)
    }

    addBars() {
        let y = this.y;
        let x = this.x;
        this.plot.selectAll('.bar')
            .data(this.data)
            .enter()
            .append('rect')
            .classed('bar', true)
            .attr('x', this.xScale(0))
            .attr('y', d => this.yScale(y(d)))
            .attr('fill', d => this.color(y(d)))
            .attr('width', d => this.xScale(x(d)))
            .attr('height', this.yScale.bandwidth())

        this.plot.selectAll('.data-label')
            .data(this.data)
            .enter()
            .append('text')
            .text(d => Math.round(x(d)))
            .attr('font-size', 10)
            .attr('font-family', 'sans-serif')
            .attr('dy', '0.32em')
            .attr('x', d => this.xScale(x(d)) + 8)
            .attr('y', d => this.yScale(y(d)) + this.yScale.bandwidth()/2)
    }
}