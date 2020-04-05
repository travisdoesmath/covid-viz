class BarChart {

    constructor(opts) {
        this.x = d => d.x;
        this.y = d => d.y;
    
        this.data = opts.data;
        this.element = opts.element;
        this.color = opts.color;

        if(opts.x) this.x = opts.x;
        if(opts.y) this.y = opts.y;

        this.draw();
    }

    draw() {
        this.width = this.element.offsetWidth;
        this.height = document.documentElement.clientHeight * 0.85;
        this.margin = {
            top: 0,
            right: 20,
            bottom: 20,
            left: 10
        };

        this.element.innerHTML = '';
        const svg = d3.select(this.element).append('svg');
        svg.attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMinYMid')
            .attr('width', this.width)
            .attr('height', this.height)

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
            .padding(0.5);
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

        // this.plot.append("g")
        //     .attr("class", "y axis")
        //     .call(yAxis)
    }

    addBars() {
        let y = this.y;
        let x = this.x;

        var barGroups = this.plot.selectAll('.bar-group')
            .data(this.data)
            .enter()
            .append('g')
            .classed('bar-group', true)
            .attr('transform',d => `translate(0,${this.yScale(y(d))})`)

        barGroups.selectAll('.bar')
                .data(d => d.data ? d.data : [{'week':0, 'weekday':0, 'offset':0, 'count':d.count}])
                .enter()
                .append('rect')
                .classed('bar', true)
                .attr('x', d => this.xScale(d.offset))
                .attr('y', 0)
                .attr('fill', d => this.color(d.date))
                .attr('width', d => this.xScale(x(d)))
                .attr('height', this.yScale.bandwidth())

        // data labels
        this.plot.selectAll('.data-label')
            .data(this.data)
            .enter()
            .append('text')
            .text(d => `${y(d)}: ${d3.format(",.0f")(x(d))}`)
            .attr('font-size', '1.25vh')
            .attr('font-family', 'sans-serif')
            .attr('dy', '0.32em')
            .attr('x', d => this.xScale(0))
            .attr('y', d => this.yScale(y(d)) - this.yScale.bandwidth()/2)
    }
}