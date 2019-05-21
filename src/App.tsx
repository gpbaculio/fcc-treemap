import React, { Component } from 'react';
import axios from 'axios';

import { datasets } from './contants';

interface AppProps {}
interface AppState {
  load: boolean;
  data: {
    name: string;
    children: {
      name: string;
      children: { name: string; category: string; value: string }[];
    }[];
  };
  error: string;
}

class App extends Component<AppProps, AppState> {
  state = {
    load: false,
    data: {
      name: '',
      children: []
    },
    error: ''
  };
  componentDidMount = async () => {
    try {
      const { data } = await axios.get(datasets.videoGames.url);
      console.log('data ', data);
    } catch (error) {
      this.setState({ error });
    }
  };
  render() {
    return <div className='svg-container' />;
  }
}

export default App;
