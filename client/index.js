import {render} from 'react-dom'
// eslint-disable-next-line no-unused-vars
import React from 'react'
// eslint-disable-next-line no-unused-vars
import App from './components/App'
// import SocketWrapper from './SocketWrapper'
//
// let SocketWorker = require('worker-loader?name=SocketWorker.[hash].js!./SocketWorker')
// // eslint-disable-next-line no-undef
//
// let socketWorker = new SocketWorker()
// let socket = new SocketWrapper()
//
// socketWorker.addEventListener('message', (event) => {
//   this.onAudio(event.data)
// })
// import wio from 'socketio-shared-webworker/socket.io-worker'
// import SharedWorker from 'socketio-shared-webworker/shared-worker'
//
// const socket = wio(config.io);
// socket.setWorker('node_modules/socketio-shared-webworker/shared-worker.js')
import io from 'socket.io-client'

const socket = io(config.io)
const containerEl = document.getElementById('app')
require('./components/app.scss')

render(
  <App socket={socket}/>,
  containerEl
)

let onFirstTouch = () => {

  try {
    var AudioContext = window.AudioContext || window.webkitAudioContext ||
      window.mozAudioContext ||
      window.oAudioContext ||
      window.msAudioContext
    var audioContext = new AudioContext()

    // create empty buffer
    var buffer = audioContext.createBuffer(1, 1, 22050)
    var source = audioContext.createBufferSource()
    source.buffer = buffer

    // connect to output (your speakers)
    source.connect(audioContext.destination)

    // play the file
    source.noteOn(0)
  } catch (e) {
    console.log(e)
  }

  document.body.classList.add('touch')
  window.removeEventListener('touchstart', onFirstTouch, false)
}

window.addEventListener('touchstart', onFirstTouch, false)
