import { render } from 'react-dom';
import React from 'react';
import App from './components/App';

import io from 'socket.io-client'
const socket = io(config.io);
const containerEl = document.getElementById('app');
require('./app.scss')

render(
    <App socket={ socket }/>,
    containerEl
);

if ('ontouchstart' in window) {
    $('body').addClass('touch');
}
