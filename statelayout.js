class AreaSubChart {
    constructor(opts) {
        this.x = d => d.x;
        this.y = d => d.y;
    
        this.data = opts.data;
        this.state = opts.state;
        this.plot = opts.plot;
        this.translate = opts.translate;
        this.height = opts.height;
        this.width = opts.width;
        this.margin = {
            top: 10,
            right: 1,
            bottom: 1,
            left: 1
        }
        this.bgColor = '#DDD'
        this.fillColor = 'rgb(204, 29, 31)';
        this.strokeColor = '#67000D';

        if(opts.modal) this.modal = opts.modal;

        if(opts.x) this.x = opts.x;
        if(opts.y) this.y = opts.y;

        if(opts.xScale) this.xScale = opts.xScale;
        if(opts.yScale) this.yScale = opts.yScale;

        if(opts.boxSize) this.boxSize = opts.boxSize;

        if(opts.height) this.height = opts.height;
        if(opts.width) this.width = opts.width;

        this.draw();
    }

    draw() {
        this.subplot = this.plot.append('g')
            .attr('transform', this.translate)
            .on('click', d => {
                this.modal.data = this.data
                this.modal.show()
                this.modal.draw()
            })

        this.createScales();
        this.addAreas();
    }

    createScales() {
        // pass
    }

    addAreas() {
        let y = this.y;
        let x = this.x;

        this.xScale.range([this.margin.left, this.width - this.margin.left - this.margin.right])
        this.yScale.range([this.height - this.margin.top - this.margin.bottom, this.margin.top])

        let area = d3.area()
            .x(d => this.xScale(x(d)))
            .y0(d => this.yScale(0))
            .y1(d => this.yScale(y(d)))

        let line = d3.line()
            .x(d => this.xScale(x(d)))
            .y(d => this.yScale(y(d)))

        this.subplot.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', this.bgColor)
            .attr('stroke','white')
            .attr('stroke-width', 2)

        let g = this.subplot.append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)

        
        g.append('path')
            .datum(this.data)
            .style('fill', this.fillColor)
            .attr('opacity', 0.75)
            .attr('stroke', 'none')
            .attr('d', area)

        g.append('path')
            .datum(this.data)
            .style('fill', 'none')
            .attr('stroke', 'none')
            .attr('d', area)

        this.subplot.append('text')
            .attr('font-size',10)
            .attr('x', this.xScale.range()[1]/2)
            .attr('y', 15)
            .style('text-anchor', 'middle')
            .text(this.state)


    }
}

class Modal {

    constructor(opts) {  
        this.element = opts.element;
    }

    show() {
        d3.select(this.element).style('display', 'block')
    }

    hide() {
        d3.select(this.element).style('display', 'none')
    }

    draw() {
        this.width = this.element.offsetWidth;
        this.height = this.width * 0.75;
        this.margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        };

        this.element.innerHTML = '';
        d3.select(this.element)
            // .style('display', 'block')
            .on('click', () => {
                this.hide();
            })
        const bg = d3.select(this.element).append("div")
            .attr("class", "bg")
        const fg = d3.select(this.element).append("div")
            .attr("class", "fg")
        this.chartArea = fg.append("div")
            .attr("class", "modal-chart")
            // .style("width", "100%")
            // .style("height", "100%")

        this.addChart();
    }

    addChart() {
        const stateLineChart = new LineChart({
            element: this.chartArea.node(),
            data: this.data,
            x: d => d.date,
            y: d => d.deaths,
            tooltipY: d => d.deaths
        })
    }
}

class StateLayout {

    constructor(opts) {  
        this.x = d => d.x;
        this.y = d => d.y;
    
        this.data = opts.data;
        this.element = opts.element;
        if(opts.x) this.x = opts.x;
        if(opts.y) this.y = opts.y;

        this.modal = new Modal({
            element: document.querySelector('.state-modal'),
            data: this.data,
            x: d => d.date,
            y: d => d.deaths
        })

        this.draw();
    }

    draw() {
        this.width = this.element.offsetWidth;
        this.height = this.width * 0.75;
        this.margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
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
        this.addCharts();
    }

    createScales() {
        this.boxSize = Math.min((this.width - this.margin.right - this.margin.left) / 12, (this.height - this.margin.top - this.margin.bottom) / 8)
        const xMin = d3.min(Object.keys(stateDataObj).map(state => d3.min(stateDataObj[state],this.x)))
        const xMax = d3.max(Object.keys(stateDataObj).map(state => d3.max(stateDataObj[state],this.x)))
        const yMax = d3.max(Object.keys(stateDataObj).map(state => d3.max(stateDataObj[state],this.y)))
        const mapWidth = this.boxSize * 12;
        const mapHeight = this.boxSize * 8;
        const xMargin = (this.width - this.margin.right - this.margin.left - mapWidth)/2;
        const yMargin = (this.height - this.margin.top - this.margin.bottom - mapHeight)/2;

        this.xLayoutScale = d3.scaleLinear()
            .domain([0,12])
            .range([xMargin, this.width - this.margin.right - this.margin.left - xMargin])

        this.yLayoutScale = d3.scaleLinear()
            .domain([0,8])
            .range([yMargin, this.height - this.margin.top - this.margin.bottom - yMargin])

        this.xScale = d3.scaleTime()
            .range([0, this.boxSize])
            .domain([xMin, xMax])

        this.yScale = d3.scaleLinear()
            .range([this.boxSize, 0])
            .domain([0, yMax])
    }


    addCharts() {
        var stateTileCoords = [
            {state:'AK', x:0, y:0},
            {state:'AL', x:6, y:6},
            {state:'AR', x:5, y:5},
            {state:'AZ', x:2, y:5},
            {state:'CA', x:1, y:4},
            {state:'CO', x:3, y:4},
            {state:'CT', x:10, y:3},
            {state:'DC', x:9, y:5},
            {state:'DE', x:10, y:4},
            {state:'FL', x:8, y:7},
            {state:'GA', x:7, y:6},
            {state:'HI', x:0, y:7},
            {state:'IA', x:5, y:3},
            {state:'ID', x:2, y:2},
            {state:'IL', x:6, y:3},
            {state:'IN', x:7, y:3},
            {state:'KS', x:4, y:5},
            {state:'KY', x:6, y:4},
            {state:'LA', x:5, y:6},
            {state:'MA', x:11, y:2},
            {state:'MD', x:9, y:4},
            {state:'ME', x:11, y:0},
            {state:'MI', x:7, y:2},
            {state:'MN', x:5, y:2},
            {state:'MO', x:5, y:4},
            {state:'MS', x:6, y:5},
            {state:'MT', x:3, y:2},
            {state:'NC', x:8, y:5},
            {state:'ND', x:4, y:2},
            {state:'NE', x:4, y:4},
            {state:'NH', x:11, y:1},
            {state:'NJ', x:10, y:2},
            {state:'NM', x:3, y:5},
            {state:'NV', x:2, y:3},
            {state:'NY', x:9, y:2},
            {state:'OH', x:8, y:3},
            {state:'OK', x:4, y:6},
            {state:'OR', x:1, y:3},
            {state:'PA', x:9, y:3},
            {state:'RI', x:11, y:3},
            {state:'SC', x:8, y:6},
            {state:'SD', x:4, y:3},
            {state:'TN', x:7, y:5},
            {state:'TX', x:4, y:7},
            {state:'UT', x:2, y:4},
            {state:'VA', x:8, y:4},
            {state:'VT', x:10, y:1},
            {state:'WA', x:1, y:2},
            {state:'WI', x:6, y:2},
            {state:'WV', x:7, y:4},
            {state:'WY', x:3, y:3},
        ]

        stateTileCoords.forEach(d => {
            
            var chart = new AreaSubChart({
                xScale: this.xScale,
                translate: `translate(${this.xLayoutScale(d.x)},${this.yLayoutScale(d.y)})`,
                data: this.data[d.state],
                plot: this.plot,
                modal: this.modal,
                x: this.x,
                y: this.y,
                height: this.boxSize,
                width: this.boxSize,
                xScale: this.xScale,
                yScale: this.yScale,
                state: d.state,
            })

        })

            

    }
}