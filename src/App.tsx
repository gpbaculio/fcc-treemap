import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './App.css';

import { datasets } from './contants';

interface AppProps {}

interface Child {
  id: string;
  name: string;
  middleName?: string;
  children: NestedChild[];
}
interface NestedChild {
  name: string;
  category: string;
  value: string;
  id: string;
  middleName?: string;
}
interface DataInterface {
  id: string;
  name: string;
  middleName?: string;
  children: Child[];
}
interface AppState {
  load: boolean;
  data: DataInterface;
  error: string;
}
interface sumData {
  category?: string;
  value?: string;
  id: string;
  name: string;
  children: never[];
}

class App extends Component<AppProps, AppState> {
  state = {
    load: false,
    data: {
      id: '',
      name: '',
      children: []
    },
    error: ''
  };
  componentDidMount = async () => {
    try {
      const { data } = await axios.get(datasets.videoGames.url);
      const d2 = await d3.json(datasets.videoGames.url);
      this.setState(
        {
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
    } catch (error) {
      this.setState({ error });
    }
  };
  createChart = () => {
    const width = 900,
      height = 600;

    const fader = function(color: string) {
        return d3.interpolateRgb(color, '#fff')(0.2);
      },
      color = d3.scaleOrdinal(d3.schemeCategory10.map(fader)),
      format = d3.format(',d');

    const treemap = d3
      .treemap()
      .size([width, height])
      .paddingInner(1);

    const svg = d3
      .select('.svg-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    const { data } = this.state;
    var root = d3
      .hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
      })
      .sum((d: sumData) => {
        return d.value ? Number(d.value) : 0;
      })
      .sort(function(a, b) {
        return b.height - a.height ? b.height - a.height : b.value! - a.value!;
      });
  };
  render() {
    return (
      <div className='svg-container d-flex align-items-center justify-content-center flex-column' />
    );
  }
}

export default App;
