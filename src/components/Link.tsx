import React, { Component } from 'react';
import { dataIds } from '../App';

interface LinkProps {
  ds: string;
  changeLink: (dataId: dataIds) => void;
}

const dsUrls = {
  videoGames: 'Video Games Data Set',
  movies: 'Movies Data Set',
  kickStarter: 'Kickstarter Data Set'
};

class Link extends Component<LinkProps> {
  render() {
    const { ds, changeLink } = this.props;
    return (
      <div>
        {ds === 'movies' && '|'}
        <span onClick={() => changeLink(ds as dataIds)} className='mx-1 url'>
          {dsUrls[ds as dataIds]}
        </span>
        {ds === 'movies' && '|'}
      </div>
    );
  }
}

export default Link;
