import React, {Component} from 'react'
import nipplejs from 'nipplejs'

require('./gamepad.scss')

const reverseMap = {
  'left': 37,
  'right': 39,
  'up': 38,
  'down': 40
}

export default class GamePad extends Component {
  constructor(props) {
    super(props)
    this.moveHandler = props.moveHandler
    this.socket = props.socket
    this.state = {move: props.move}
  }

  componentDidMount() {
    var options = {
      zone: document.getElementById('joystick'),
      mode: 'static',
      color: 'black',
      position: {left: '50%', top: '50%'}
    }
    this.manager = nipplejs.create(options)
    this.manager.on('start end', (evt, data) => {
      if (evt.type === 'end') {
        this.setState({move: null})
        this.stopSending()
      }
    }).on('dir:up dir:left dir:down dir:right', (evt, data) => {
      console.log(evt.type.split(':')[1])
      this.startSending(evt.type.split(':')[1])
    })
  }

  componentWillUnmount() {
    if (this.manager) {
      this.manager.destroy()
    }
  }

  componentWillReceiveProps(props) {
    // this.socket.emit('move', this.state.move)
    // this.moveHandler(this.state.move)
  }

  send(move) {
    if (move) {
      if (move === 'a' || move === 'b') {
        clearInterval(this.moveInterval)
      }
      this.setState({move: move})
      this.socket.emit('move', this.state.move)
    }
  }

  startSending(move) {
    clearInterval(this.moveInterval)
    this.moveInterval = setInterval(() => {
      this.send(move)
    }, 50)
  }

  stopSending() {
    clearInterval(this.moveInterval)
  }

  render() {
    return (<div id="gamepad">
      <div id="joystick" className="d-pad"></div>
      {/*      <div className="select"></div>
      <div className="start"></div>*/}
      <div className="b-button" onClick={this.send.bind(this, 'b')}></div>
      <div className="a-button" onClick={this.send.bind(this, 'a')}></div>
    </div>)
  }
}
