import React, {Component} from 'react'
import bus from '../EventService'
import $ from 'jquery'
import ReactLoading from 'react-loading'

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
      img: `data:image/png;base64,${config.img}`,
      audio: ''
    }
  }

  componentDidMount() {

    document.addEventListener('keydown', this.onKeyDown.bind(this), false)

    this.socket.on('connection', this.onConnection.bind(this))
    this.socket.on('emumove', this.onEmuMove.bind(this))
    this.socket.on('frame', this.onFrame.bind(this))
    this.socket.on('audio', this.onAudio.bind(this))

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


  onFrame(frame) {
    const blob = new Blob([frame], {type: 'image/png'})
    const objectURL = URL.createObjectURL(blob)
    this.setState({img: objectURL, loading: false})
  }

  playAudioBuffer(buffer) {
    var source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)
    source.start(0)
  }

  onAudio(audio) {
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
    var decodedBuffer = this.audioContext.decodeAudioData(audio, (callbackBuffer) => {
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

      // const blob = new Blob([audio], {type: 'audio/wav'})
      // let objectURL = URL.createObjectURL(blob)
      // this.audio = document.getElementById('audioId')
      // this.setState({audio: objectURL, loading: false}, function () {
      //   this.audio = document.getElementById('audioId')
      //   // this.audio && this.audio.pause()
      //   this.audio.load()
      //   // this.audio.onload = function (evt) {
      //   // this.audio.play()
      //   // }
      //   // this.refs.audio.play() }
      // })
    }
    // document.getElementById('audio').play()
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
