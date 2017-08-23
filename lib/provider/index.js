'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Provider = {
  init: function init(config) {
    this.application = new _application2.default();
    this.application.init(config);
    this.application.launch();
  },
  on: function on(eventName, listener) {
    this.application.on(eventName, listener);
  },
  fullscreen: function fullscreen(source) {
    this.application.fullscreen(source);
  },
  httpError: function httpError(error) {
    this.application.httpError(error);
  },
  trigger: function trigger(event, detail) {
    this.application.trigger(event, detail);
  },
  loadPage: function loadPage(url) {
    this.application.loadPage(url);
  }
};

exports.default = Provider;