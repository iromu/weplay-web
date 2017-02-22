process.title = 'weplay-web';

const discoveryPort = process.env.DISCOVERY_PORT || 3070;
const discoveryUrl = process.env.DISCOVERY_URL || 'http://localhost:3010';

const BackendService = require('./BackendService');
const service = new BackendService(discoveryUrl, discoveryPort);

require('weplay-common').cleanup(service.destroy.bind(service));
