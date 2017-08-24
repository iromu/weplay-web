import React, {Component} from 'react'
import bus from '../EventService'
import $ from 'jquery'
import ReactLoading from 'react-loading'

const AudioStreamWritable = require('web-audio-stream/writable')

const concat = function () {
  const buffers = Array.prototype.slice.call(arguments)
  const buffer1 = buffers[0]
  const buffer2 = buffers[1]
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer

}

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
let AudioWorker = require('worker-loader?name=AudioWorker.[hash].js!../workers/AudioWorker')
let FrameWorker = require('worker-loader?name=FrameWorker.[hash].js!../workers/FrameWorker')

export default class Game extends Component {
  constructor(props) {
    super(props)
    this.socket = props.socket
    this.state = {
      loading: true,
      connections: config.connections,
      moveemu: '',
      img: `data:image/png;base64,${config.img}`,
      audio: ''
    }
    this.toWavArrayBufferCount = 0
    this.tempAudioBuffer = new Float32Array()
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
      this.tempAudioBuffer = concat(this.tempAudioBuffer, event.data)
      this.toWavArrayBufferCount++
    })
    setInterval(() => {
      if (this.toWavArrayBufferCount > 0) {
        // this.playAudioBuffer(this.tempAudioBuffer)
        this.onAudio(this.tempAudioBuffer)
        this.toWavArrayBufferCount = 0
        this.tempAudioBuffer = new Float32Array()
      }
    }, 10)
    this.frameWorker.addEventListener('message', (event) => {
      this.onFrame(event.data)
    })
    this.socket.on('connection', this.onConnection.bind(this))
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

    // reset game img size for mobile now that we loaded
    $('#game img').css('height', '100%')


// Listener to fire up keyboard events on mobile devices for control overlay
    $('table.screen-keys td').mousedown(function () {
      const id = $(this).attr('id')
      const code = reverseMap[id]
      const e = $.Event('keydown')
      e.keyCode = code
      $(document).trigger(e)

      $(this).addClass('pressed')
      const self = this
      setTimeout(() => {
        $(self).removeClass('pressed')
      }, 1000)
    })


// Highlights controls when image or button pressed
    function highlightControls() {
      $('table.screen-keys td:not(.empty-cell)').addClass('highlight')

      setTimeout(() => {
        $('table.screen-keys td').removeClass('highlight')
      }, 300)
    }

    $('img').mousedown(highlightControls)
    $('table.screen-keys td').mousedown(highlightControls)

  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown(ev) {
    console.log('onKeyDown')
    if (this.nick === undefined) {
      return
    }
    const code = ev.keyCode
    if ($('body').hasClass('input_focus')) {
      return
    }
    if (map[code]) {
      ev.preventDefault()
      this.socket.emit('move', map[code])
    }
    if (command[code]) {
      this.setState({loading: true})
      ev.preventDefault()
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
    source.start(0)
  }

  onAudio(audio) {
    const decodedBuffer = this.audioContext.decodeAudioData(audio, (callbackBuffer) => {
      this.playAudioBuffer(callbackBuffer)
    })
    if (decodedBuffer) {
      // Decoding was successful, do something useful with the audio buffer
      if (typeof decodedBuffer.then === 'function') {
        decodedBuffer.then((promisedBuffer) => {
          this.playAudioBuffer(promisedBuffer)
        })
      } else {
        this.playAudioBuffer(decodedBuffer)
      }
    } else {
      console.log('Decoding the audio buffer failed')
    }
  }

  onAudioXX(audio) {
    if (!this.writable) {
      this.writable = AudioStreamWritable(this.audioContext.destination, {
        context: this.audioContext,
        channels: 2,
        sampleRate: this.audioContext.sampleRate,

        //BUFFER_MODE, SCRIPT_MODE, WORKER_MODE (pending web-audio-workers)
        mode: AudioStreamWritable.BUFFER_MODE,

        //disconnect node if input stream ends
        autoend: false
      })
    }
    this.writable.write(audio)
  }

  onConnection() {
    console.log('onConnection')
    this.setState({loading: false})
  }

  render() {
    if (this.state.loading) {
      return (<div id="game"><ReactLoading type='cylon' color='#e3e3e3'/></div>)
    }
    else
      return (
        <div id="game">
          {this.state.audio ?
            <audio id="audioId" autoPlay>
              <source src={`${this.state.audio}`} type="audio/wav"/>
            </audio> : <audio id="audioId"/>}
          {this.state.img ? <img alt="game" src={`${this.state.img}`}/> : <img alt="game"/>}
          <i title="You can control the game with your keyboard"
             className="keyboard icon-keyboard-1">&nbsp;</i>
          <span className="count-wrapper">
                  Online: <span className="count">{this.state.connections}</span>
                </span>
          <span className="move-wrapper">
                  <span className="moveemu">{this.state.moveemu}</span>
                </span>
          <table id="mov-keys" className="unjoined screen-keys">
            <tbody>
            <tr>
              <td className="empty-cell"/>
              <td id="up">↑</td>
              <td className="empty-cell"/>
            </tr>
            <tr>
              <td id="left">←</td>
              <td id="down">↓</td>
              <td id="right">→</td>
            </tr>
            </tbody>
          </table>
          <table id="keys" className="unjoined screen-keys">
            <tbody>
            <tr>
              <td id="start">start</td>
              <td id="select">select</td>
            </tr>
            <tr>
              <td id="b" className="round">B</td>
              <td id="a" className="round">A</td>
            </tr>
            </tbody>
          </table>
        </div>
      )
  }
}
