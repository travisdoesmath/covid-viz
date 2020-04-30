class AreaChart {

    constructor(opts) {
        this.x = d => d.x;
        this.y = d => d.y;

        
    
        this.data = opts.data;
        this.element = opts.element;
        this.color = opts.color;
        this.stackKeys = opts.stackKeys;

        this.series = d3.stack().keys(this.stackKeys)(this.data)

        if(opts.x) this.x = opts.x;
        if(opts.y) this.y = opts.y;

        this.draw();
    }

    draw() {
        this.width = this.element.offsetWidth;
        this.height = this.width * 0.5;
        this.margin = {
            top: 0,
            right: 20,
            bottom: 20,
            left: 50
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
        this.addAreas();
        this.addAxes();
    }

    createScales() {
        const xExtent = d3.extent(this.data, this.x);

        this.xScale = d3.scaleTime()
            .range([0, this.width - this.margin.right - this.margin.left])
            .domain(xExtent)

        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.series, d => d3.max(d, d => d[1]))])
            .range([this.height - this.margin.top - this.margin.bottom, this.margin.bottom])
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

    addAreas() {
        let y = this.y;
        let x = this.x;

        let area = d3.area()
            //.curve(d3.curveMonotoneX)
            .x(d => this.xScale(x(d.data)))
            .y0(d => this.yScale(d[0]))
            .y1(d => this.yScale(d[1]))

        this.plot.selectAll('.area')
            .data(this.series)
            .enter()
            .append('path')
                .attr('fill', ({key}) => this.color(key))
                .attr('stroke', ({key}) => this.color(key))
                .attr('stroke-width', 1)
                .attr('d', area)
    }
}