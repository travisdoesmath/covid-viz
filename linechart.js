class LineChart {

    constructor(opts) {
        this.x = d => d.x;
        this.y = d => d.y;
        this.tooltipY = d => d.y;

        this.data = opts.data;
        if(opts.gridData) this.gridData = opts.gridData;
        this.element = opts.element;
        this.color = opts.color;

        if(opts.x) this.x = opts.x;
        if(opts.y) this.y = opts.y;
        if(opts.tooltipY) this.tooltipY = opts.tooltipY;

        if(opts.gridY) this.gridY = opts.gridY;
        if(opts.gridLabel) this.gridLabel = opts.gridLabel;

        this.draw();
    }

    draw() {
        this.width = this.element.offsetWidth;
        this.height = this.width * 0.5;

        console.log(this.width)

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

        let tooltipLayer = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        this.tooltip = tooltipLayer
            .append('g')
            .style('opacity',0)

        this.tooltipBg = this.tooltip.append('rect')
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('stroke-opacity', 0.2)
                .attr('rx', 5)

        this.tooltipText = this.tooltip.append('text')


        this.createScales();
        this.addLines();
        this.addAxes();
    }

    createScales() {
        const xExtent = d3.extent(this.data, this.x);
        const yMax = d3.max(this.data, d => this.y(d));

        this.xScale = d3.scaleTime()
            .range([0, this.width - this.margin.right - this.margin.left])
            .domain(xExtent)

        this.yScale = d3.scaleLinear()
            .domain([0, yMax])
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

    addLines() {
        let y = this.y;
        let x = this.x;

        let line = d3.line()
            .curve(d3.curveMonotoneX)
            .x(d => this.xScale(x(d)))
            .y(d => this.yScale(y(d)))

        if (this.gridData) {
            this.plot.selectAll('.grid')
                .data(this.gridData)
                .enter()
                .append('line')
                .attr('class', 'grid')
                .attr('x1', this.xScale.range()[0])
                .attr('x2', this.xScale.range()[1])
                .attr('y1', d => this.yScale(this.gridY(d)))
                .attr('y2', d => this.yScale(this.gridY(d)))
        }

        this.plot           
            .append('path')
            .datum(this.data)
            .attr('class', 'line')
            .attr('stroke', '#67000D')
            .attr('stroke-width', 2)
            .attr('d', line)

        this.plot.selectAll('.marker')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class','marker')
            .attr('fill', '#67000D')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('cx', d => this.xScale(this.x(d)))
            .attr('cy', d => this.yScale(this.y(d)))
            .attr('r', 4)

        const voronoi = d3.voronoi()
            .x(d => this.xScale(this.x(d)))
            .y(d => this.yScale(this.y(d)))
            .extent([[0,0],[this.width, this.height]])

        var tooltipFunction = (d, i, els) => {
            
            console.log(d);

            this.tooltipText
                .text(`${this.tooltipY(d.data)}`)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('font-size', `12px`)

            this.tooltip
                .attr('transform', `translate(${this.xScale(this.x(d.data))},${this.yScale(this.y(d.data))})`)
                .style('opacity', .9)
                .style('pointer-events','none')

            this.tooltipBg
                .attr('x', -this.tooltipText.node().getBBox().width/2 - 5)
                .attr('y', -this.tooltipText.node().getBBox().height/2 - 5)
                .attr('width', this.tooltipText.node().getBBox().width + 10)
                .attr('height', this.tooltipText.node().getBBox().height + 10)
        }

        this.plot.selectAll('.voronoi')
            .data(voronoi.polygons(this.data))
            .enter()
            .append('path')
                .attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
                .on('mouseover', tooltipFunction)
                .on('mouseenter', tooltipFunction)
                .on('mouseout', d => {

                })
                .attr('fill', 'none')
                //.attr('stroke', 'black')
                .attr('pointer-events', 'all')


    }
}