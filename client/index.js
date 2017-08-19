import {render} from 'react-dom'
// eslint-disable-next-line no-unused-vars
import React from 'react'
// eslint-disable-next-line no-unused-vars
import App from './components/App'

import io from 'socket.io-client'

// eslint-disable-next-line no-undef
const socket = io(config.io)
const containerEl = document.getElementById('app')
require('./components/app.scss')

render(
  <App socket={socket}/>,
  containerEl
)

let onFirstTouch = function () {
  document.body.classList.add('touch')
  window.removeEventListener('touchstart', onFirstTouch, false)
}
window.addEventListener('touchstart', onFirstTouch, false)
