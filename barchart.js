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
        this.height = Math.max(document.documentElement.clientHeight * 0.85, this.width*0.7);
        this.margin = {
            top: 0,
            right: 20,
            bottom: 20,
            left: 10
        };

        this.element.innerHTML = '';
        d3.select(this.element)
            .classed('loaded', true)
            .style('background-image', 'none');
        const svg = d3.select(this.element).append('svg');
        svg.attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMinYMid')
            .attr('width', this.width)
            .attr('height', this.height)
        
        const defs = svg.append('defs')

        defs.append('pattern')
            .attr('id', 'diag-stripes')
            .attr('height', 4)
            .attr('width', 4)
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternTransform','rotate(45)')
            .append('rect')
            .attr('width', 2)
            .attr('height', 4)
            .attr('fill','white')
            .attr('transform','translate(0,0)')

        defs.append('mask')
            .attr('id', 'diag-stripes-mask')
            .attr('width', 1)
            .attr('height', 1)
            .append('rect')
            .attr('width', 10000)
            .attr('height', 10000)
            .attr('fill', 'url(#diag-stripes)')

        this.plot = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.tooltip = d3.select(this.element).append('div')
            .attr('class','tooltip')
            .style('opacity',0);

        d3.select(document).on('scroll', () => {
            this.tooltip
                .style('opacity', 0);
        })

        this.createScales();
        this.addBars();
        // this.addAxes();
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

        var tooltipFunction = (d, i, els) => {
            if (d.label !== -1) {
                this.tooltip
                    .html(`${d.label}<br>${d.count}`)
                    .style('font-size', `${this.yScale.bandwidth() * 0.75}px`)
                
                this.tooltip
                    .style('left', `${els[i].getBoundingClientRect().x + els[i].getBoundingClientRect().width / 2 - this.tooltip.node().getBoundingClientRect().width/2}px`)
                    .style('top', `${els[i].getBoundingClientRect().y - this.tooltip.node().getBoundingClientRect().height - this.yScale.bandwidth() * 0.25}px`)
                    .style('opacity', 1)
                    .style('pointer-events','none')
            }
        }

        barGroups.selectAll('.bar')
                .data(d => d.data ? d.data : [{'week':0, 'weekday':0, 'offset':0, 'count':d.count}])
                .enter()
                .append('g')
                .classed('bar', true)
                .on('mouseenter', tooltipFunction)
                .on('mouseover', tooltipFunction)
                .on('mouseout', () => {
                    this.tooltip.style('opacity', 0);
                })
                .append('rect')
                .attr('x', d => this.xScale(d.offset))
                .attr('y', 0)
                .attr('fill', d => this.color(d.label))
                .attr('stroke', 'white')
                .attr('shape-rendering','crispEdges')
                .attr('mask', d => d.label === 'Current*' ? "url(#diag-stripes-mask)" : "")
                .attr('width', d => this.xScale(x(d)))
                .attr('height', this.yScale.bandwidth())
        
        barGroups.selectAll('bar')


        // data labels
        this.plot.selectAll('.data-label')
            .data(this.data)
            .enter()
            .append('text')
            .text(d => `${y(d)}: ${d3.format(",.0f")(x(d))}`)
            .attr('font-size', this.yScale.bandwidth()*.8)
            .attr('font-family', 'sans-serif')
            .attr('dy', '0.32em')
            .attr('x', d => this.xScale(0))
            .attr('y', d => this.yScale(y(d)) - this.yScale.bandwidth()/2)
    }
}