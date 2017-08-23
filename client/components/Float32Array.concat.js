ArrayBuffer.prototype.concat = function () {
  const buffers = Array.prototype.slice.call(arguments)
  // add self
  buffers.unshift(this)
  const buffer1 = buffers[0]
  const buffer2 = buffers[1]
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer

}
