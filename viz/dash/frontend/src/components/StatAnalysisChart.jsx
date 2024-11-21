import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const StatAnalysisChart = ({ data }) => {
    const chartRef = useRef(null);
    const histogramRef = useRef(null);

    const styles = {
        font: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
        colors: {
            background: '#1c2026',
            text: '#ffffff',
            textSecondary: '#8a919e',
            pieColors: [
                '#f7931a', 
                '#2ecc71', 
                '#3498db', 
                '#9b59b6', 
                '#e74c3c', 
                '#f1c40f'  
            ],
            gold: '#ffd700',
            accent: '#4a90e2'
        }
    };

    const renderPieChart = () => {
        try {
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.log('No data available for pie chart');
                return;
            }

          
            d3.select(chartRef.current).selectAll('*').remove();

            
            const width = 750; 
            const height = 550; 
            const margin = {
                top: 80,
                right: 250, 
                bottom: 80,
                left: 160
            };

            const radius = Math.min(width - margin.left - margin.right,
                height - margin.top - margin.bottom) / 2;

            const svg = d3.select(chartRef.current)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            // Add title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .style('font-size', '24px')
                .style('fill', styles.colors.gold)
                .style('font-family', styles.font)
                .style('font-weight', 'bold')
                .text('Entity Type Distribution');

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left + radius},${height / 2})`); 

            // Add shadow filter
            const defs = svg.append('defs');
            const filter = defs.append('filter')
                .attr('id', 'shadow')
                .attr('height', '130%');

            filter.append('feGaussianBlur')
                .attr('in', 'SourceAlpha')
                .attr('stdDeviation', 3)
                .attr('result', 'blur');

            filter.append('feOffset')
                .attr('in', 'blur')
                .attr('dx', 2)
                .attr('dy', 2)
                .attr('result', 'offsetBlur');

            const feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode')
                .attr('in', 'offsetBlur');
            feMerge.append('feMergeNode')
                .attr('in', 'SourceGraphic');

            // Process data
            const entityTypes = _.groupBy(data, 'ENTITY_TYPE');
            const pieData = Object.entries(entityTypes)
                .map(([type, items]) => ({
                    type: type || 'Unknown',
                    value: items.length,
                    percentage: ((items.length / data.length) * 100).toFixed(1)
                }))
                .filter(item => item.type !== 'Unknown' && item.type !== null && item.type !== '')
                .sort((a, b) => b.value - a.value);

            console.log('Pie Chart Data:', pieData);

            const pie = d3.pie()
                .value(d => d.value)
                .sort(null)
                .padAngle(0.03);

            const arc = d3.arc()
                .innerRadius(radius * 0.6)
                .outerRadius(radius)
                .cornerRadius(4);

            // Generate arcs
            const arcs = g.selectAll('path')
                .data(pie(pieData))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', (d, i) => styles.colors.pieColors[i % styles.colors.pieColors.length])
                .attr('stroke', 'white')
                .style('stroke-width', '2px')
                .style('filter', 'url(#shadow)')
                .style('opacity', 0.9)
                .on('mouseover', function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style('opacity', 1)
                        .attr('transform', function (d) {
                            const centroid = arc.centroid(d);
                            return `translate(${centroid[0] * 0.05},${centroid[1] * 0.05})`;
                        });
                })
                .on('mouseout', function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style('opacity', 0.9)
                        .attr('transform', 'translate(0,0)');
                });

            // Add Legend
            const legend = svg.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(${width - margin.right + 20}, ${margin.top})`); 

            pieData.forEach((d, i) => {
                const legendRow = legend.append('g')
                    .attr('transform', `translate(0, ${i * 25})`);

                // Colored rectangle
                legendRow.append('rect')
                    .attr('width', 18)
                    .attr('height', 18)
                    .attr('fill', styles.colors.pieColors[i % styles.colors.pieColors.length]);

                // Entity type and percentage text
                legendRow.append('text')
                    .attr('x', 24)
                    .attr('y', 14)
                    .attr('text-anchor', 'start')
                    .style('font-size', '14px')
                    .style('fill', styles.colors.text)
                    .style('font-family', styles.font)
                    .text(`${d.type} (${d.percentage}%)`);
            });

        } catch (error) {
            console.error('Error rendering pie chart:', error);
        }
    };

    const renderHistogram = () => {
        try {
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.log('No data available for histogram');
                return;
            }

            d3.select(histogramRef.current).selectAll('*').remove();

     
            const width = 750; 
            const height = 550; 
            const margin = {
                top: 60,
                right: 60,
                bottom: 60,
                left: 80
            };

            const svg = d3.select(histogramRef.current)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            // Add title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .style('font-size', '24px')
                .style('fill', styles.colors.gold)
                .style('font-family', styles.font)
                .style('font-weight', 'bold')
                .text('Distribution of Transaction Sizes (Log Scale)');

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Filter and process data for log scale
            const validSizes = data
                .map(d => parseFloat(d.AVG_TRANSACTION_SIZE))
                .filter(size => size > 0 && !isNaN(size))
                .map(size => Math.log10(size)); 

            console.log('Valid transaction sizes:', validSizes.length);

            // Create linear scale for log-transformed data
            const x = d3.scaleLinear()
                .domain([Math.floor(d3.min(validSizes)), Math.ceil(d3.max(validSizes))])
                .range([0, width - margin.left - margin.right]);

            // Create histogram with linear bins for log-transformed data
            const histogram = d3.histogram()
                .domain(x.domain())
                .thresholds(30) 
                .value(d => d);

            const bins = histogram(validSizes);

            const y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)])
                .range([height - margin.top - margin.bottom, 0])
                .nice();

            // Add bars
            g.selectAll('rect')
                .data(bins)
                .join('rect')
                .attr('x', d => x(d.x0) + 1)
                .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
                .attr('y', d => y(d.length))
                .attr('height', d => y(0) - y(d.length))
                .attr('fill', styles.colors.pieColors[0])
                .attr('stroke', 'white')
                .attr('stroke-width', '1px')
                .style('opacity', 0.8)
                .on('mouseover', function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style('opacity', 1)
                        .attr('fill', styles.colors.gold);

                
                    const originalMin = Math.pow(10, d.x0);
                    const originalMax = Math.pow(10, d.x1);
                    svg.append('text')
                        .attr('class', 'tooltip')
                        .attr('x', x(d.x0) + margin.left)
                        .attr('y', y(d.length) + margin.top - 10)
                        .attr('text-anchor', 'middle')
                        .style('fill', styles.colors.text)
                        .style('font-size', '12px')
                        .style('font-family', styles.font)
                        .text(`Range: ${originalMin.toFixed(4)}-${originalMax.toFixed(4)} BTC, Count: ${d.length}`);
                })
                .on('mouseout', function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style('opacity', 0.8)
                        .attr('fill', styles.colors.pieColors[0]);

                    svg.selectAll('.tooltip').remove();
                });

            // Add x-axis formatted for log scale
            const xAxis = g.append('g')
                .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
                .call(d3.axisBottom(x)
                    .tickFormat(d => {
                        return `10${d3.format("")(d)}`;
                    })
                    .ticks(5))
                .style('color', styles.colors.textSecondary);
                
            // Make the axis lines and ticks visible
            xAxis.selectAll('line')
                .style('stroke', styles.colors.textSecondary);
            xAxis.selectAll('path')
                .style('stroke', styles.colors.textSecondary);

            // Add y-axis
            const yAxis = g.append('g')
                .call(d3.axisLeft(y))
                .style('color', styles.colors.textSecondary);

            // Add axis labels
            g.append('text')
                .attr('x', (width - margin.left - margin.right) / 2)
                .attr('y', height - margin.top - margin.bottom + 40)
                .attr('text-anchor', 'middle')
                .style('fill', styles.colors.textSecondary)
                .style('font-family', styles.font)
                .text('Transaction Size (BTC) - Log Scale');

            g.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -(height - margin.top - margin.bottom) / 2)
                .attr('y', -40)
                .attr('text-anchor', 'middle')
                .style('fill', styles.colors.textSecondary)
                .style('font-family', styles.font)
                .text('Number of Entities');

        } catch (error) {
            console.error('Error rendering histogram:', error);
        }
    };

    useEffect(() => {
        try {
            console.log('Data received:', data);
            if (chartRef.current && histogramRef.current) {
                renderPieChart();
                renderHistogram();
            }
        } catch (error) {
            console.error('Error in useEffect:', error);
        }
    }, [data]);

    return (
        <div className="bg-[#1c2026] p-12 rounded-lg">
            <div className="flex flex-col gap-16">
                <div className="flex justify-center items-center bg-[#0d1116] p-12 rounded-xl"> 
                    <div ref={chartRef} className="w-full h-[700px]" /> 
                </div>
                <div className="flex justify-center items-center bg-[#0d1116] p-12 rounded-xl"> 
                    <div ref={histogramRef} className="w-full h-[700px]" /> 
                </div>
            </div>
        </div>
    );
};

export default StatAnalysisChart;










