import io from 'socket.io-client'

let SocketWorker = require('shared-worker-loader!./workers/SocketWorker.js')

class SocketBrokerPrivate {
  constructor(uri, onConnect, onDisConnect) {
    this.uri = uri
    this.onConnect = onConnect
    this.onDisConnect = onDisConnect
    this.socket = null
    this.worker = null
    this.onError = null
    this.events = {}
  }

  getKeys(obj) {
    const keys = []
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i)
      }
    }
    return keys
  }

  onMessage(type, message) {
    if (this.events[type]) this.events[type](message)
  }

  startWorker() {
    this.worker = new SocketWorker(this.uri)
    this.worker.port.start()
    this.worker.port.addEventListener('message', (event) => {
      this.onMessage(event.data.type, event.data.message)
    }, false)

    this.worker.onerror = (evt) => {
      if (this.onError) this.onError(evt)
    }
    this.worker.port.postMessage({events: this.getKeys(this.events)})
  }

  startSocketIo() {
    this.socket = io(this.uri)
    for (const eventName in this.events) {
      if (this.events.hasOwnProperty(eventName)) {
        this.socket.on(eventName, this.socketOnEventHandler(eventName))
      }
    }
  }

  socketOnEventHandler(eventName) {
    return (e) => {
      this.onMessage(eventName, e)
    }
  }
}

export default class SocketBroker extends SocketBrokerPrivate {
  on(eventName, callback) {
    this.events[eventName] = callback
  }

  emit(eventName, data) {
    if (this.worker) {
      this.worker.port.postMessage({event: eventName, data: data})
    } else {
      this.socket.emit(eventName, data)
    }
  }

  start() {
    if (!SharedWorker) {
      this.startSocketIo()
    } else {
      this.startWorker()
    }
  }

  onError(cbk) {
    this.onError = cbk
  }
}
