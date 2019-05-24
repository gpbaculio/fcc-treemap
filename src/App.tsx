import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './App.css';

import { datasets } from './contants';
import { Link } from './components';

interface AppProps {}

interface Child {
  id: string;
  name: string;
  children: NestedChild[];
}
interface NestedChild {
  name: string;
  category: string;
  value: string;
  id: string;
}
interface DataInterface {
  id: string;
  name: string;
  middleName?: string;
  children: Child[];
}

export type dataIds = 'videoGames' | 'movies' | 'kickStarter';

interface AppState {
  dataId: string;
  title: string;
  desc: string;
  load: boolean;
  data: DataInterface;
  error: string;
}

interface dataArg {
  category?: string;
  value?: string;
  name?: string;
  children?: never[];
}

class App extends Component<AppProps, AppState> {
  state = {
    dataId: 'videoGames',
    title: '',
    desc: '',
    load: false,
    data: {
      id: '',
      name: '',
      children: []
    },
    error: ''
  };
  componentDidMount = () => {
    try {
      this.queryData();
    } catch (error) {
      this.setState({ error });
    }
  };
  queryData = async () => {
    const { dataId } = this.state;
    const { data } = await axios.get(datasets[dataId as dataIds].url);
    this.setState(
      {
        desc: datasets[dataId as dataIds].desc,
        title: data.name,
        data: {
          ...data,
          id: data.name,
          children: data.children.map((child: Child) => ({
            ...child,
            children: child.children.map((nestedChild: NestedChild) => ({
              ...nestedChild,
              id: `${data.name}.${child.name}.${nestedChild.name}`
            })),
            id: `${data.name}.${child.name}`
          }))
        }
      },
      () => this.createChart()
    );
  };
  handleLinkChange = (dataId: dataIds) => {
    d3.selectAll(`.${this.state.dataId}`).remove();
    this.setState({ dataId }, () => this.queryData());
  };
  createChart = () => {
    const width = 900,
      height = 600;

    const fader = function(color: string) {
        return d3.interpolateRgb(color, '#fff')(0.2);
      },
      color = d3.scaleOrdinal(d3.schemeCategory10.map(fader)),
      format = d3.format(',d');
    // Define the div for the tooltip
    const tooltip = d3
      .select('.svg-container')
      .append('div')
      .attr('class', `${this.state.dataId} tooltip`)
      .attr('id', 'tooltip')
      .style('opacity', 0);

    const treemap = d3
      .treemap()
      .size([width, height])
      .paddingInner(1);

    const svg = d3
      .select('.svg-container')
      .append('svg')
      .attr('class', `${this.state.dataId}`)
      .attr('width', width)
      .attr('height', height);

    const { data } = this.state;

    var root = d3
      .hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
      })
      .sum((d: dataArg) => {
        return d.value ? Number(d.value) : 0;
      })
      .sort(function(a, b) {
        return b.height - a.height ? b.height - a.height : b.value! - a.value!;
      });

    treemap(root);

    const cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', function(d: any) {
        return 'translate(' + d.x0 + ',' + d.y0 + ')';
      });

    const tile = cell
      .append('rect')
      .attr('id', function(d) {
        return d.data.id;
      })
      .attr('class', 'tile')
      .attr('width', function(d: any) {
        return d.x1 - d.x0;
      })
      .attr('height', function(d: any) {
        return d.y1 - d.y0;
      })
      .attr('data-name', function(d) {
        return d.data.name;
      })
      .attr('data-category', function(d: any) {
        return d.data.category;
      })
      .attr('data-value', function(d: any) {
        return d.data.value;
      })
      .attr('fill', function(d: any) {
        return color(d.data.category);
      })
      .on('mousemove', function(d: any) {
        console.log('d value', d.data.value);
        tooltip.style('opacity', 0.9);
        tooltip
          .html(
            'Name: ' +
              d.data.name +
              '<br>Category: ' +
              d.data.category +
              '<br>Value: ' +
              d.data.value
          )
          .attr('data-value', d.data.value)
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.style('opacity', 0);
      });

    cell
      .append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data(function(d) {
        return d.data.name.split(/(?=[A-Z][^A-Z])/g);
      })
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', function(d, i) {
        return 13 + i * 10;
      })
      .text(function(d) {
        return d;
      });

    let categories = root.leaves().map(function(nodes: any) {
      return nodes.data.category;
    });
    categories = categories.filter(function(category, index, self) {
      // remove same text categories
      return self.indexOf(category) === index;
    });

    const legend = d3
      .select('.svg-container')
      .append('svg')
      .attr('class', `${this.state.dataId}`)
      .attr('id', 'legend')
      .attr('width', 500);

    const legendWidth = +legend.attr('width');
    const LEGEND_OFFSET = 10;
    const LEGEND_RECT_SIZE = 15;
    const LEGEND_H_SPACING = 150;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;
    const legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

    let legendElem = legend
      .append('g')
      .attr('transform', 'translate(60,' + LEGEND_OFFSET + ')')
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', function(d, i) {
        return (
          'translate(' +
          (i % legendElemsPerRow) * LEGEND_H_SPACING +
          ',' +
          (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
            LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
          ')'
        );
      });
    legendElem
      .append('rect')
      .attr('width', LEGEND_RECT_SIZE)
      .attr('height', LEGEND_RECT_SIZE)
      .attr('class', 'legend-item')
      .attr('fill', function(d) {
        return color(d);
      });
    legendElem
      .append('text')
      .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
      .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
      .text(function(d) {
        return d;
      });
  };
  render() {
    const { title, desc } = this.state;
    return (
      <div className='d-flex flex-column align-items-center'>
        <div className='d-flex mt-4'>
          {Object.keys(datasets).map(ds => (
            <Link changeLink={this.handleLinkChange} key={ds} ds={ds} />
          ))}
        </div>
        <h1 id='title' className='mt-3'>
          {title}
        </h1>
        <div id='description'>{desc}</div>
        <div className='my-3 svg-container d-flex align-items-center justify-content-center flex-column' />
      </div>
    );
  }
}

export default App;
