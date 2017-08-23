'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _jsonrpcDispatch = require('jsonrpc-dispatch');

var _jsonrpcDispatch2 = _interopRequireDefault(_jsonrpcDispatch);

var _uri = require('../lib/uri');

var _uri2 = _interopRequireDefault(_uri);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Application container class which represents an application frame hosting
 * an app on a 3rd party domain.
 */
var Frame = function (_EventEmitter) {
  _inherits(Frame, _EventEmitter);

  function Frame() {
    _classCallCheck(this, Frame);

    return _possibleConstructorReturn(this, (Frame.__proto__ || Object.getPrototypeOf(Frame)).apply(this, arguments));
  }

  _createClass(Frame, [{
    key: 'init',


    /**
    * @param {object} container - The DOM node to append the application frame to.
    * @param {string} source - The url source of the application
    * @param {object} options - An optional parameter that contains a set of optional configs
    */
    value: function init(container, source) {
      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref$secret = _ref.secret,
          secret = _ref$secret === undefined ? null : _ref$secret,
          _ref$resizeConfig = _ref.resizeConfig,
          resizeConfig = _ref$resizeConfig === undefined ? {} : _ref$resizeConfig;

      this.source = source;
      this.container = container;
      this.iframe = null;
      this.wrapper = null;
      this.origin = new _uri2.default(this.source).origin;
      this.secret = secret;
      this.resizeConfig = resizeConfig;
      this.handleProviderMessage = this.handleProviderMessage.bind(this);
      this.initIframeResizer = this.initIframeResizer.bind(this);

      var self = this;
      this.JSONRPC = new _jsonrpcDispatch2.default(self.send.bind(self), {
        launch: function launch() {
          self.wrapper.setAttribute('data-status', 'launched');
          self.emit('xfc.launched');
          return Promise.resolve();
        },
        authorized: function authorized() {
          var detail = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          self.wrapper.setAttribute('data-status', 'authorized');
          self.emit('xfc.authorized', detail);
          self.initIframeResizer();
          return Promise.resolve();
        },
        resize: function resize() {
          var height = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
          var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          if (typeof resizeConfig.customCalculationMethod === 'function') {
            resizeConfig.customCalculationMethod.call(self.iframe);
            return Promise.resolve();
          }

          if (height) {
            self.iframe.style.height = height;
          }

          if (width) {
            self.iframe.style.width = width;
          }
          return Promise.resolve();
        },
        event: function event(_event, detail) {
          self.emit(_event, detail);
          return Promise.resolve();
        },
        authorizeConsumer: function authorizeConsumer() {
          return Promise.resolve('hello');
        },
        challengeConsumer: function challengeConsumer() {
          return Promise.resolve(self.secret);
        },
        loadPage: function loadPage(url) {
          self.origin = new _uri2.default(url).origin;
          self.source = url;
          self.wrapper.setAttribute('data-status', 'mounted');
          self.iframe.src = url; // Triggers the loading of new page
          return Promise.resolve();
        }
      });
    }
  }, {
    key: 'initIframeResizer',
    value: function initIframeResizer() {
      var config = this.resizeConfig;

      // If user chooses to use fixedHeight or fixedWidth,
      // set height/width to the specified value and keep unchanged.
      if (config.fixedHeight || config.fixedWidth) {
        if (config.fixedHeight) {
          this.iframe.style.height = config.fixedHeight;
        }
        if (config.fixedWidth) {
          this.iframe.style.width = config.fixedWidth;
        }
      } else {
        // If user chooses to update iframe dynamically,
        // replace customCalculationMethod by a boolean indicator
        // in config because method is not transferrable.
        if (typeof config.customCalculationMethod === 'function') {
          config = Object.assign({}, config);
          config.customCal = true;
          delete config.customCalculationMethod;
        }
        this.JSONRPC.notification('resize', [config]);
      }
    }

    /**
    * Mount this application onto its container and initiate resize sync.
    */

  }, {
    key: 'mount',
    value: function mount() {
      if (this.iframe) return;

      // Set up listener for all incoming communication
      window.addEventListener('message', this.handleProviderMessage);

      this.wrapper = document.createElement('div');
      this.wrapper.className = 'xfc';
      this.wrapper.setAttribute('data-status', 'mounted');
      this.container.appendChild(this.wrapper);

      var iframe = document.createElement('iframe');
      iframe.src = this.source;
      if (!this.resizeConfig.scrolling) {
        iframe.style.overflow = 'hidden';
        iframe.scrolling = 'no';
      }
      this.iframe = iframe;
      this.wrapper.appendChild(iframe);

      this.emit('xfc.mounted');
    }

    /**
     * Unmount this application from its container
     */

  }, {
    key: 'unmount',
    value: function unmount() {
      if (this.wrapper.parentNode === this.container) {
        this.container.removeChild(this.wrapper);
        this.emit('xfc.unmounted');
      }
    }

    /**
    * Handles an incoming message event by processing the JSONRPC request
    * @param {object} event - The emitted message event.
    */

  }, {
    key: 'handleProviderMessage',
    value: function handleProviderMessage(event) {
      // 1. This isn't a JSONRPC message, exit.
      if (!event.data.jsonrpc) return;

      // 2. Identify the app the message came from.
      if (this.iframe.contentWindow !== event.source) return;

      // 3. Verify that the origin of the app is trusted
      // For Chrome, the origin property is in the event.originalEvent object
      var origin = event.origin || event.originalEvent.origin;
      if (origin === this.origin) {
        _logger2.default.log('<< consumer', event.origin, event.data);

        // 4. Send a response, if any, back to the app.
        this.JSONRPC.handle(event.data);
      }
    }

    /**
    * Post the given message to the application frame.
    * @param {object} message - The message to post.
    * See: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    */

  }, {
    key: 'send',
    value: function send(message) {
      if (message) {
        _logger2.default.log('>> consumer', this.origin, message);
        this.iframe.contentWindow.postMessage(message, this.origin);
      }
    }

    /**
    * Triggers an event within the embedded application.
    * @param {string} event - The event name to trigger.
    * @param {object} detail - The data context to send with the event.
    */

  }, {
    key: 'trigger',
    value: function trigger(event, detail) {
      this.JSONRPC.notification('event', [event, detail]);
    }
  }]);

  return Frame;
}(_events.EventEmitter);

exports.default = Frame;