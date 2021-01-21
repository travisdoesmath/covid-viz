
class AreaChart {

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

        this.dataObj = {};

        // let nestedData = d3.nest().key(d => d.date).entries(data);

        this.keys = Array.from(new Set(this.data.map(x => x.state)))

        this.data.forEach(d => {
            if (this.dataObj[d.date]) {
                this.dataObj[d.date][d.state] = d.death
            } else {
                this.dataObj[d.date] = {}
                this.dataObj[d.date][d.state] = d.death
            }
        })

        this.dataRows = Object.keys(this.dataObj).map(date => {
            let row = {}; 
            row.date = d3.timeParse('%Y%m%d')(date); 
            this.keys.forEach(state => row[state] = this.dataObj[date][state] ? this.dataObj[date][state] : 0); 
            return row; 
        })

        this.stackedData = d3.stack()
            .keys(this.keys)
            // .order(d3.stackOrderAscending)
            .order(d3.stackOrderDescending)
        (this.dataRows)

        if(opts.gridY) this.gridY = opts.gridY;
        if(opts.gridLabel) this.gridLabel = opts.gridLabel;

        this.draw();
    }

    draw() {
        this.width = this.element.offsetWidth;
        this.height = this.width * 0.5;

        this.margin = {
            top: 0,
            right: 50,
            bottom: 20,
            left: 50
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
        
        this.plot = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        let tooltipLayer = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        this.tooltip = tooltipLayer
            .append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '14')
            .attr('text-anchor', 'start')
            .style('opacity',0)

        this.tooltipText = this.tooltip.append('text')


        this.createScales();
        this.addAreas();
        this.addAxes();
    }

    createScales() {
        const xExtent = d3.extent(this.dataRows.map(d => this.x(d)));
        const yMax = d3.max(this.data, d => this.y(d));

        this.xScale = d3.scaleTime()
            .range([0, this.width - this.margin.right - this.margin.left])
            .domain(xExtent)

        // this.yScale = d3.scaleLinear()
        //     .domain([0, yMax])
        //     .range([this.height - this.margin.top - this.margin.bottom, this.margin.bottom])

        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.stackedData, d => d3.max(d, d => d[1]))]).nice()
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

        // let line = d3.line()
        //     .curve(d3.curveMonotoneX)
        //     .x(d => this.xScale(x(d)))
        //     .y(d => this.yScale(d.movingAverage))

        let area = d3.area()
            // .curve(d3.curveMonotoneX)
            .x(d => this.xScale(x(d.data)))
            .y0(d => this.yScale(d[0]))
            .y1(d => this.yScale(d[1]))

        // if (this.gridData) {
        //     this.plot.selectAll('.grid')
        //         .data(this.gridData)
        //         .enter()
        //         .append('line')
        //         .attr('class', 'grid')
        //         .attr('x1', this.xScale.range()[0])
        //         .attr('x2', this.xScale.range()[1])
        //         .attr('y1', d => this.yScale(this.gridY(d)))
        //         .attr('y2', d => this.yScale(this.gridY(d)))
        // }

        // this.data.forEach((d, i, arr) => {
        //     let sum = 0;
        //     let n = 7;
        //     let startIndex = Math.max(0, i - n);
        //     let endIndex = Math.min(i + n, arr.length - 1)
        //     for (let j = startIndex; j <= endIndex; j++) {
        //         sum += y(arr[j]);
        //     }
        //     if (i < arr.length - n) {
        //         d.movingAverage = sum / (2*n);
        //     } else {
        //         d.movingAverage = NaN;
        //     }
        // })

        var tooltipFunction = (d, i, els) => {

            console.log('tooltip d', d)



            this.tooltipText.html(`<tspan x="0" dy="0em">${d.key}</tspan><tspan x="0" dy="1.2em">${(d[d.length - 1][1] - d[d.length - 1][0]).toLocaleString()}</tspan>`)
            
            // this.tooltipY.forEach((t, i) => {
            //     this.tooltipText.append('tspan')
            //         .text(`${t(d.data)}`)
            //         .attr('x',0)
            //         .attr('dy', `${i == 0 ? 0 : 1.2}em`)
            //         .attr('text-anchor', 'middle')
            //         .attr('dominant-baseline', 'middle')
            //         .style('font-size', `12px`)
            // })
                
            this.tooltip
                .attr('transform', `translate(${this.width - this.margin.left - this.margin.right + 5},${this.yScale(0.5*(d[d.length - 1][0] + d[d.length - 1][1]))})`)
                .style('opacity', .9)
                .style('pointer-events','none')
        }

        this.plot.selectAll('.area').data(this.stackedData)
          .enter()
            .append('path')
            .attr('class', 'area')
            //.attr('stroke', '#67000D')
            .attr('fill', d => this.color(d.key))
            .attr('stroke-width', 2)
            .attr('d', area)
            .on('mouseover', tooltipFunction)
            .on('mouseenter', tooltipFunction)
            .on('mouseout', d => {

            })



    }
}