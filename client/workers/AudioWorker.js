const concat = function () {
  const buffers = Array.prototype.slice.call(arguments)
  const buffer1 = buffers[0]
  const buffer2 = buffers[1]
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer
}

self.toWavArrayBufferCount = 0
self.tempAudioBuffer = new Float32Array()

// Respond to message from parent thread
self.addEventListener('message', (event) => {
  self.tempAudioBuffer = concat(self.tempAudioBuffer, event.data)
  self.toWavArrayBufferCount++
})

setInterval(() => {
  if (self.toWavArrayBufferCount > 0) {
    self.postMessage(self.tempAudioBuffer)
    self.toWavArrayBufferCount = 0
    self.tempAudioBuffer = new Float32Array()
  }
}, 10)
