/* eslint-disable no-undef */
// import io from 'socket.io-client'
importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.slim.js')

var socket
self.addEventListener('message', (messageEvent) => {
  if (messageEvent.data.uri) {
    socket = io(messageEvent.data.uri)
    socket.on('connect', () => {
      self.postMessage({type: 'connect'})
    })
    socket.on('disconnect', () => {
      self.postMessage({type: 'disconnect'})
    })
  }
  const events = messageEvent.data.events
  if (events) {
    for (const index in events) {
      const eventName = events[index]
      socket.on(eventName, (e) => {
        self.postMessage({type: eventName, message: e})
      })
    }
  } else if (messageEvent.data.event && messageEvent.data.data) {
    console.log('emit', messageEvent.data.event, messageEvent.data.data)
    socket.emit(messageEvent.data.event, messageEvent.data.data)
  }
})
