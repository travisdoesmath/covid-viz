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
        this.height = window.innerHeight*0.85;
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

        // data labels
        this.plot.selectAll('.data-label')
            .data(this.data)
            .enter()
            .append('text')
            .text(d => `${y(d)}: ${Math.round(x(d))}`)
            .attr('font-size', '1.25vh')
            .attr('font-family', 'sans-serif')
            .attr('dy', '0.32em')
            .attr('x', d => this.xScale(0))
            .attr('y', d => this.yScale(y(d)) - this.yScale.bandwidth()/2)
    }
}