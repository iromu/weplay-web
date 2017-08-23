// Respond to message from parent thread
self.addEventListener('message', (event) => {
  const blob = new Blob([event.data], {type: 'image/png'})
  const objectURL = URL.createObjectURL(blob)
  self.postMessage(objectURL)
})
