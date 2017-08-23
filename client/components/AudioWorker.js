// Respond to message from parent thread
self.addEventListener('message', (event) => {
  self.postMessage(event.data)
})
