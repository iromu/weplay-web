import React, {Component} from 'react'
import $ from 'jquery'
import ReactLoading from 'react-loading'

import bus from '../EventService'
import GamePad from './GamePad'

let AudioWorker = require('worker-loader?name=AudioWorker.[hash].js!../workers/AudioWorker')
let FrameWorker = require('worker-loader?name=FrameWorker.[hash].js!../workers/FrameWorker')

require('./game.scss')

const map = {
  37: 'left',
  39: 'right',
  65: 'a',
  83: 'b',
  66: 'b',
  38: 'up',
  40: 'down',
  79: 'select',
  13: 'start'
}

const command = {
  49: 'game#0',
  50: 'game#1',
  51: 'game#2',
  52: 'game#3',
  53: 'game#4',
  54: 'game#5',
  55: 'game#6',
  56: 'game#7',
  57: 'game#8',
  48: 'game#9'
}

export default class Game extends Component {
  constructor(props) {
    super(props)
    this.socket = props.socket
    this.state = {
      loading: true,
      connections: config.connections,
      moveemu: '',
      move: props.move,
      img: `data:image/png;base64,${config.img}`,
      audio: ''
    }
    this.toWavArrayBufferCount = 0
    this.tempAudioBuffer = new Float32Array()
  }

  moveHandler(move) {
    this.setState({move: move})
  }
  componentDidMount() {
    if (!this.audioContext) {
      try {
        var AudioContext = window.AudioContext || window.webkitAudioContext ||
          window.mozAudioContext ||
          window.oAudioContext ||
          window.msAudioContext
        this.audioContext = new AudioContext()
      } catch (e) {
        alert('Web Audio API is not supported in this browser')
      }
    }
    this.frameWorker = new FrameWorker()
    this.audioWorker = new AudioWorker()
    document.addEventListener('keydown', this.onKeyDown.bind(this), false)
    this.audioWorker.addEventListener('message', (event) => {
      // this.tempAudioBuffer = concat(this.tempAudioBuffer, event.data)
      // this.toWavArrayBufferCount++
      this.decodeWav(event.data)
    })
    // setInterval(() => {
    //   if (this.toWavArrayBufferCount > 0) {
    //     // this.playAudioBuffer(this.tempAudioBuffer)
    //     this.decodeWav(this.tempAudioBuffer)
    //     this.toWavArrayBufferCount = 0
    //     this.tempAudioBuffer = new Float32Array()
    //   }
    // }, 40)
    this.frameWorker.addEventListener('message', (event) => {
      this.onFrame(event.data)
    })
    this.socket.on('emumove', this.onEmuMove.bind(this))
    this.socket.on('frame', (data) => {
      this.frameWorker.postMessage(data)
    })
    this.socket.on('audio', (data) => {
      this.audioWorker.postMessage(data)
    })

    bus.on('nick', (nick) => {
      this.nick = nick
    })
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  componentWillReceiveProps(props) {
    // if(props.move) this.state.move = props.move
    // this.socket.emit('move', this.state.move)
  }

  onKeyDown(ev) {
    const code = ev.keyCode
    if ($('body').hasClass('input_focus')) {
      return
    }
    if (map[code]) {
      ev.preventDefault()
      this.setState({move: map[code]})
      this.socket.emit('move', map[code])
    }
    if (command[code]) {
      // this.setState({loading: true})
      ev.preventDefault()
      if (this.prevSource) {
        this.prevSource.stop(0)
      }
      this.socket.emit('command', command[code])
    }
  }

  onEmuMove() {
    console.log('onEmuMove')
  }

  onFrame(objectURL) {
    this.setState({img: objectURL, loading: false})
  }

  playAudioBuffer(buffer) {
    var source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)
    source.loop = true
    if (this.prevSource) {
      this.prevSource.stop(0)
    }
    source.start(0)
    this.prevSource = source
  }

  decodeWav(audio) {
    this.audioContext.decodeAudioData(audio, (callbackBuffer) => {
      this.playAudioBuffer(callbackBuffer)
    })
  }

  render() {
    if (this.state.loading) {
      return (<div id="game"><ReactLoading type='cylon' color='#e3e3e3'/></div>)
    } else
      return (
        <div id="game">
          {this.state.img ? <img alt="game" src={`${this.state.img}`}/> : <img alt="game"/>}
          <i title="You can control the game with your keyboard"
             className="keyboard icon-keyboard-1">&nbsp;</i>
          <span className="count-wrapper">
                  Online: <span className="count">{this.state.connections}</span>
                </span>
          <span className="move-wrapper">
                  <span className="moveemu">{this.state.move}</span>
          </span>
          <GamePad socket={this.socket} moveHandler={this.moveHandler}/>
        </div>
      )
  }
}
