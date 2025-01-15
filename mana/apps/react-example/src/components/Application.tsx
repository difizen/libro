import { useInject } from '@difizen/mana-app';
import React, { useEffect } from 'react';

import { State } from '../state';

import './Application.scss';
import { icons } from './Icons';

const Application: React.FC = () => {
  const state = useInject(State);

  const counter = state.counter;

  /**
   * On component mount
   */
  useEffect(() => {
    const useDarkTheme = parseInt(localStorage.getItem('dark-mode'));
    if (isNaN(useDarkTheme)) {
      state.darkTheme = true;
    } else if (useDarkTheme === 1) {
      state.darkTheme = true;
    } else if (useDarkTheme === 0) {
      state.darkTheme = false;
    }
  }, [state]);

  /**
   * On Dark theme change
   */
  useEffect(() => {
    if (state.darkTheme) {
      localStorage.setItem('dark-mode', '1');
      document.body.classList.add('dark-mode');
    } else {
      localStorage.setItem('dark-mode', '0');
      document.body.classList.remove('dark-mode');
    }
  }, [state.darkTheme]);

  /**
   * Toggle Theme
   */
  function toggleTheme() {
    state.darkTheme = !state.darkTheme;
  }

  return (
    <div id='erwt'>
      <div className='header'>
        <div className='main-heading'>
          <h1 className='themed'>React Webpack Typescript</h1>
        </div>
        <div className='main-teaser'>
          <div>
            Robust boilerplate for Desktop Applications with Electron and ReactJS. Hot
            Reloading is used in this project for fast development experience.
            <br />
            If you think the project is useful enough, just spread the word around!
          </div>
        </div>
        <div className='versions'>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.erwt} /> ERWT
            </div>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.typescript} /> Typescript
            </div>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.react} /> React
            </div>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.webpack} /> Webpack
            </div>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.chrome} /> Chrome
            </div>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.license} /> License
            </div>
          </div>
        </div>
      </div>

      <div className='footer'>
        <div className='center'>
          <button
            onClick={() => {
              if (counter > 99) {
                return alert('Going too high!!');
              }
              state.counter += 1;
            }}
          >
            Increment {counter !== 0 ? counter : ''} <span>{counter}</span>
          </button>
          &nbsp;&nbsp; &nbsp;&nbsp;
          <button
            onClick={() => {
              if (counter === 0) {
                return alert('Oops.. thats not possible!');
              }
              state.counter = counter > 0 ? counter - 1 : 0;
            }}
          >
            Decrement <span>{counter}</span>
          </button>
          &nbsp;&nbsp; &nbsp;&nbsp;
          <button onClick={toggleTheme}>
            {state.darkTheme ? 'Light Theme' : 'Dark Theme'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Application;
