import io from 'socket.io-client'

const socket = io()

socket.on('frame', (data) => {
  self.postMessage({event: 'frame', data: data})
})
socket.on('connection', (data) => {
  self.postMessage({event: 'connection', data: data})
})
socket.on('emumove', (data) => {
  self.postMessage({event: 'emumove', data: data})
})
socket.on('frame', (data) => {
  self.postMessage({event: 'frame', data: data})
})

// Respond to message from parent thread
self.addEventListener('message', (event) => {

})
