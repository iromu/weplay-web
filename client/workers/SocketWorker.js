/* eslint-disable no-undef */
// import io from 'socket.io-client'
importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.slim.js')

var socket = io(self.name)
var ports = []

addEventListener('connect', (portEvent) => {
  var port = portEvent.ports[0]
  ports.push(port)
  port.start()
  port.addEventListener('message', (messageEvent) => {
    const events = messageEvent.data.events
    if (events) {
      for (const index in events) {
        const eventName = events[index]
        socket.on(eventName, (e) => {
          port.postMessage({type: eventName, message: e})
        })
      }
    } else if (messageEvent.data.event && messageEvent.data.data) {
      console.log('emit', messageEvent.data.event, messageEvent.data.data)
      socket.emit(messageEvent.data.event, messageEvent.data.data)
    }
  })
})

socket.on('connect', () => {
  for (var i = 0; i < ports.length; i++) {
    ports[i].postMessage({type: 'connect'})
  }
})

socket.on('disconnect', () => {
  for (var i = 0; i < ports.length; i++) {
    ports[i].postMessage({type: 'disconnect'})
  }
})
