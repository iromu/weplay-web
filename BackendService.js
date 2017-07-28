const mustache = require('mustache-express')
const express = require('express')
const env = process.env.NODE_ENV || 'development'
const port = process.env.WEPLAY_PORT || 3000
const logger = require('weplay-common').logger('weplay-web')

const ioUrl = process.env.WEPLAY_IO_URL || 'http://localhost:3001'

const EventBus = require('weplay-common').EventBus
const redis = require('weplay-common').redis()

class BackendService {
  constructor(discoveryUrl, discoveryPort) {
    this.uuid = require('node-uuid').v4()
    this.logger = require('weplay-common').logger('weplay-web-service', this.uuid)
    this.discoveryUrl = discoveryUrl
    this.url = ioUrl
    this.bus = new EventBus({
      url: discoveryUrl,
      port: discoveryPort,
      name: 'web',
      id: this.uuid
    }, () => {
      this.logger.info('BackendService connected to discovery server', {
        discoveryUrl: discoveryUrl,
        uuid: this.uuid
      })

      // TODO this.bus.emit('presence', 'connections:total')
    })

    this.init()
  }

  init() {
    this.logger.info('BackendService init()')

    const app = express()
    app.listen(port)

    app.engine('mustache', mustache())
    app.set('views', `${__dirname}/views`)
    if (env === 'development') {
      const webpack = require('webpack')
      const webpackConfig = require('./webpack.config.dev')

      const compiler = webpack(webpackConfig)

      app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath
      }))
      app.use(require('webpack-hot-middleware')(compiler))
    }
    app.use(express.static(`${__dirname}/public`))

    app.use((req, res, next) => {
      req.socket.on('error', err => {
        logger.error(err.stack)
      })
      next()
    })

    app.get('/', this.onIndex.bind(this))

    app.get('/:id(\\d+)', this.onGameSelected.bind(this))

    // TODO
    app.get('/screenshot.png', this.onScreenshot.bind(this))
  }

  onIndex(req, res, next) {
    logger.info('onIndex', {uiSocket: this.url})
    res.render('index.mustache', {
      img: this.image ? this.image.toString('base64') : null,
      config: JSON.stringify({
        img: this.image ? this.image.toString('base64') : null,
        io: this.url,
        connections: 0
      })
    })
  }

  onGameSelected(req, res, next) {
    var id = req.params
    logger.info('onGameSelected', {id: id, uiSocket: this.url})
    res.render('index.mustache', {
      img: this.image ? this.image.toString('base64') : null,
      config: JSON.stringify({
        img: this.image ? this.image.toString('base64') : null,
        io: this.url,
        connections: 0,
        selection: id
      })
    })
  }

  // TODO
  onScreenshot(req, res, next) {
    redis.get('weplay:screenshot:DEFAULT', (err, image) => {
      if (err || !image) {
        return next(err)
      }
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      })
      res.end(image)
    })
  }

  destroy() {
    this.logger.info('BackendService destroy()')
  }
}
module.exports = BackendService
