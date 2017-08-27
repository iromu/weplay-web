import React, {Component} from 'react'

import Game from './Game'
import Chat from './Chat'
import bus from '../EventService'
import $ from 'jquery'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {data: {}, loading: true}
    this.socket = props.socket
  }

  componentDidMount() {
    this.socket.on('reload', this.onReload.bind(this))
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('load', this.handleResize)
    this.handleResize()
    setTimeout(this.handleResize, 1000)
    this.socket.on('connection', this.onConnection.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  onConnection() {
    console.log('onConnection')
    this.setState({loading: false})
  }

  onReload() {
    console.log('onReload')

    setTimeout(() => {
      location.reload()
    }, Math.floor(Math.random() * 10000) + 5000)
  }

  handleResize() {
    const windowHeight = $(window).height()
    const windowWidth = $(window).width()
    if (windowWidth <= 500) {
      $('#game').css('height', windowHeight)
      $('#game>img').css('height', windowHeight * 0.75)
      $('#gamepad').css('height', windowHeight * 0.2)
      $('#chat').css('display', 'none')
      $('.input input').css('display', 'none')
      $('.messages').css('display', 'none')
    } else {
      $('#chat, #game').css('height', windowHeight)
      $('#gamepad').css('display', 'none')
      $('.input input').css('width', $('.input').width())
      $('.messages').css('height', $('#chat').height() - 70)
    }
    bus.emit('scrollMessages')
  };

  render() {
    return (
      <div id="app">
        <Game socket={this.socket}/>
        <Chat socket={this.socket}/>
      </div>
    )
  }
}
