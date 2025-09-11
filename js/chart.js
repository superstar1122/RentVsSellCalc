// app.js
class ChartRenderer {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.width = 600;
        this.height = 400;
        this.margin = { top: 20, right: 50, bottom: 50, left: 80 };
        this.chartWidth = this.width - this.margin.left - this.margin.right;
        this.chartHeight = this.height - this.margin.top - this.margin.bottom;

        // Sample data - replace with your actual rent vs sell calculations
        this.rentData = [
            { year: 1, value: 220000 },
            { year: 2, value: 240000 },
            { year: 3, value: 260000 },
            { year: 4, value: 285000 },
            { year: 5, value: 320000 },
            { year: 6, value: 340000 },
            { year: 7, value: 365000 },
            { year: 8, value: 405000 },
            { year: 9, value: 435000 },
            { year: 10, value: 410000 }
        ];

        this.sellData = [
            { year: 1, value: 210000 },
            { year: 2, value: 220000 },
            { year: 3, value: 235000 },
            { year: 4, value: 250000 },
            { year: 5, value: 260000 },
            { year: 6, value: 280000 },
            { year: 7, value: 295000 },
            { year: 8, value: 315000 },
            { year: 9, value: 330000 },
            { year: 10, value: 345000 }
        ];

        this.init();
    }
    /** ------------------- Updated by odysseus ---------------- */
    init() {
        this.calculateScales();
        this.drawGrid();
        this.drawAxes();
        this.drawLines();
        this.drawPoints();
        this.drawLabels();
        /** ----------start of updated part--------- */
        const slider = document.getElementById('yearsSliderRange');
        const initialYear = slider ? parseInt(slider.value) : this.minYear;
        this.drawVerticalLine(initialYear);
        /** ----------end of updated part---------- */
    }

    calculateScales() {
        // Find min/max values for scaling
        const allData = [...this.rentData, ...this.sellData];
        this.minValue = Math.min(...allData.map(d => d.value));
        this.maxValue = Math.max(...allData.map(d => d.value));
        this.minYear = Math.min(...allData.map(d => d.year));
        this.maxYear = Math.max(...allData.map(d => d.year));

        // Add some padding to the value range
        const valueRange = this.maxValue - this.minValue;
        this.minValue -= valueRange * 0.1;
        this.maxValue += valueRange * 0.1;
    }

    getX(year) {
        return this.margin.left + ((year - this.minYear) / (this.maxYear - this.minYear)) * this.chartWidth;
    }

    getY(value) {
        return this.margin.top + this.chartHeight - ((value - this.minValue) / (this.maxValue - this.minValue)) * this.chartHeight;
    }

    drawGrid() {
        const gridLines = document.getElementById('gridLines');

        // Horizontal grid lines
        for (let i = 0; i <= 10; i++) {
            const value = this.minValue + (this.maxValue - this.minValue) * (i / 10);
            const y = this.getY(value);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this.margin.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', this.width - this.margin.right);
            line.setAttribute('y2', y);
            line.classList.add('grid-line');
            gridLines.appendChild(line);
        }

        // Vertical grid lines
        for (let year = this.minYear; year <= this.maxYear; year++) {
            const x = this.getX(year);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', this.margin.top);
            line.setAttribute('x2', x);
            line.setAttribute('y2', this.height - this.margin.bottom);
            line.classList.add('grid-line');
            gridLines.appendChild(line);
        }
    }

    drawAxes() {
        const axes = document.getElementById('axes');

        // X-axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', this.margin.left);
        xAxis.setAttribute('y1', this.height - this.margin.bottom);
        xAxis.setAttribute('x2', this.width - this.margin.right);
        xAxis.setAttribute('y2', this.height - this.margin.bottom);
        xAxis.classList.add('axis-line');
        axes.appendChild(xAxis);

        // Y-axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', this.margin.left);
        yAxis.setAttribute('y1', this.margin.top);
        yAxis.setAttribute('x2', this.margin.left);
        yAxis.setAttribute('y2', this.height - this.margin.bottom);
        yAxis.classList.add('axis-line');
        axes.appendChild(yAxis);
    }

    drawLines() {
        const chartLines = document.getElementById('chartLines');

        // Draw rent line
        const rentPath = this.createPathFromData(this.rentData);
        rentPath.classList.add('chart-line', 'rent-line');
        chartLines.appendChild(rentPath);

        // Draw sell line
        const sellPath = this.createPathFromData(this.sellData);
        sellPath.classList.add('chart-line', 'sell-line');
        chartLines.appendChild(sellPath);
    }

    createPathFromData(data) {
        let pathData = '';

        data.forEach((point, index) => {
            const x = this.getX(point.year);
            const y = this.getY(point.value);

            if (index === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
        });

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        return path;
    }

    drawPoints() {
        const dataPoints = document.getElementById('dataPoints');

        // Draw rent points
        this.rentData.forEach(point => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', this.getX(point.year));
            circle.setAttribute('cy', this.getY(point.value));
            circle.classList.add('data-point', 'rent-point');
            dataPoints.appendChild(circle);
        });

        // Draw sell points
        this.sellData.forEach(point => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', this.getX(point.year));
            circle.setAttribute('cy', this.getY(point.value));
            circle.classList.add('data-point', 'sell-point');
            dataPoints.appendChild(circle);
        });
    }

    drawLabels() {
        const labels = document.getElementById('labels');

        // X-axis labels (years)
        for (let year = this.minYear; year <= this.maxYear; year++) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', this.getX(year));
            text.setAttribute('y', this.height - this.margin.bottom + 20);
            text.classList.add('axis-label');
            text.textContent = year;
            labels.appendChild(text);
        }

        // Y-axis labels (values)
        for (let i = 0; i <= 5; i++) {
            const value = this.minValue + (this.maxValue - this.minValue) * (i / 5);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', this.margin.left - 10);
            text.setAttribute('y', this.getY(value) + 5);
            text.classList.add('axis-label', 'y-axis-label');
            text.textContent = this.formatValue(value);
            labels.appendChild(text);
        }
    }

    // ---------------------changed by odysseus------------------
    /**------------------start of replaced part---------- */
    drawVerticalLine(year) {
        // Remove previous line if it exists
        let existing = document.getElementById('year-indicator');
        if (existing) existing.remove();

        // Draw new line at given year
        const x = this.getX(year);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('id', 'year-indicator');
        line.setAttribute('x1', x);
        line.setAttribute('y1', this.margin.top);
        line.setAttribute('x2', x);
        line.setAttribute('y2', this.height - this.margin.bottom);
        line.classList.add('vertical-line');
        document.getElementById('gridLines').appendChild(line);
    }
    /**---------------end of replaced part----------- */

    formatValue(value) {
        // Format values as currency (e.g., 195k, 260k, etc.)
        if (value >= 1000) {
            return Math.round(value / 1000) + 'k';
        }
        return Math.round(value).toString();
    }

    // Method to update chart data (useful for your rent vs sell calculator)
    updateData(newRentData, newSellData) {
        this.rentData = newRentData;
        this.sellData = newSellData;

        // Clear existing chart elements
        document.getElementById('gridLines').innerHTML = '';
        document.getElementById('chartLines').innerHTML = '';
        document.getElementById('dataPoints').innerHTML = '';
        document.getElementById('axes').innerHTML = '';
        document.getElementById('labels').innerHTML = '';

        // Redraw chart
        this.init();
    }
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Create chart instance - you can store this globally if you need to update it later
    window.chart = new ChartRenderer('chart');
});

// Example function to demonstrate how to update the chart with new data
function updateChartWithNewData(rentData, sellData) {
    if (window.chart) {
        window.chart.updateData(rentData, sellData);
    }
}