'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonrpcDispatch = require('jsonrpc-dispatch');

var _jsonrpcDispatch2 = _interopRequireDefault(_jsonrpcDispatch);

var _string = require('../lib/string');

var _events = require('events');

var _uri = require('../lib/uri');

var _uri2 = _interopRequireDefault(_uri);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _dimension = require('../lib/dimension');

var _mutationObserver = require('mutation-observer');

var _mutationObserver2 = _interopRequireDefault(_mutationObserver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** Application class which represents an embedded application. */
var Application = function (_EventEmitter) {
  _inherits(Application, _EventEmitter);

  function Application() {
    _classCallCheck(this, Application);

    return _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).apply(this, arguments));
  }

  _createClass(Application, [{
    key: 'init',
    value: function init(_ref) {
      var _ref$acls = _ref.acls,
          acls = _ref$acls === undefined ? [] : _ref$acls,
          _ref$secret = _ref.secret,
          secret = _ref$secret === undefined ? null : _ref$secret,
          _ref$onReady = _ref.onReady,
          onReady = _ref$onReady === undefined ? null : _ref$onReady;

      this.acls = [].concat(acls);
      this.secret = secret;
      this.onReady = onReady;
      this.resizeConfig = null;
      this.requestResize = this.requestResize.bind(this);
      this.handleConsumerMessage = this.handleConsumerMessage.bind(this);
      this.authorizeConsumer = this.authorizeConsumer.bind(this);
      this.verifyChallenge = this.verifyChallenge.bind(this);
      this.emitError = this.emitError.bind(this);

      // If the document referer (parent frame) origin is trusted, default that
      // to the active ACL;
      var parentOrigin = new _uri2.default(document.referrer).origin;
      if (this.acls.includes(parentOrigin)) {
        this.activeACL = parentOrigin;
      }

      var self = this;
      this.JSONRPC = new _jsonrpcDispatch2.default(self.send.bind(self), {
        event: function event(_event, detail) {
          self.emit(_event, detail);
          return Promise.resolve();
        },
        resize: function resize() {
          var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          self.resizeConfig = config;

          self.requestResize();

          // Registers a mutation observer for body
          var observer = new _mutationObserver2.default(function (mutations) {
            return self.requestResize();
          });
          observer.observe(document.body, { attributes: true, childList: true, characterData: true, subtree: true });

          // Registers a listener to window.onresize
          // Optimizes the listener by debouncing (https://bencentra.com/code/2015/02/27/optimizing-window-resize.html#debouncing)
          var interval = 100; // Resize event will be considered complete if no follow-up events within `interval` ms.
          var resizeTimer = null;
          window.onresize = function (event) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
              return self.requestResize();
            }, interval);
          };

          return Promise.resolve();
        }
      });
    }
  }, {
    key: 'requestResize',
    value: function requestResize() {
      if (this.resizeConfig.customCal) {
        this.JSONRPC.notification('resize');
      } else if (this.resizeConfig.autoResizeWidth) {
        var width = (0, _dimension.calculateWidth)(this.resizeConfig.WidthCalculationMethod);
        this.JSONRPC.notification('resize', [null, width + 'px']);
      } else {
        var height = (0, _dimension.calculateHeight)(this.resizeConfig.heightCalculationMethod);
        this.JSONRPC.notification('resize', [height + 'px']);
      }
    }

    /**
    * Triggers an event in the parent application.
    * @param {string} event - The event name to trigger.
    * @param {object} detail - The data context to send with the event.
    */

  }, {
    key: 'trigger',
    value: function trigger(event, detail) {
      this.JSONRPC.notification('event', [event, detail]);
    }

    /**
    * Request to mount an application fullscreen.
    * @param {string} url - The url of the application to mount.
    */

  }, {
    key: 'fullscreen',
    value: function fullscreen(url) {
      this.trigger('xfc.fullscreen', url);
    }

    /**
     * Sends http errors to consumer.
     * @param  {object} error - an object containing error details
     */

  }, {
    key: 'httpError',
    value: function httpError() {
      var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.trigger('xfc.provider.httpError', error);
    }

    /**
     * Request to load a new page of given url
     * @param  {string} url - The url of the new page.
     */

  }, {
    key: 'loadPage',
    value: function loadPage(url) {
      this.JSONRPC.notification('loadPage', [url]);
    }

    /**
    * Launches the provider app and begins the authorization sequence.
    */

  }, {
    key: 'launch',
    value: function launch() {
      if (window.self !== window.top) {
        // 1: Setup listeners for all incoming communication
        window.addEventListener('message', this.handleConsumerMessage);

        // 2: Begin launch and authorization sequence
        this.JSONRPC.notification('launch');
      }
    }

    /**
    * Handles an incoming message event by processing the JSONRPC request
    * @param {object} event - The emitted message event.
    */

  }, {
    key: 'handleConsumerMessage',
    value: function handleConsumerMessage(event) {
      // Ignore Non-JSONRPC messages or messages not from the parent frame
      if (!event.data.jsonrpc || event.source !== window.parent) {
        return;
      }

      _logger2.default.log('<< provider', event.origin, event.data);
      // For Chrome, the origin property is in the event.originalEvent object
      var origin = event.origin || event.originalEvent.origin;
      if (!this.activeACL && this.acls.includes(origin)) {
        this.activeACL = origin;
      }

      if (this.acls.includes('*') || this.acls.includes(origin)) {
        this.JSONRPC.handle(event.data);
      }
    }

    /**
    * Send the given message to the frame parent.
    * @param {object} message - The message to send.
    */

  }, {
    key: 'send',
    value: function send(message) {
      // Dont' send messages if not embedded
      if (window.self === window.top) {
        return;
      }

      if (this.acls.length < 1) {
        _logger2.default.error('Message not sent, no acls provided.');
      }

      if (message) {
        _logger2.default.log('>> provider', this.acls, message);
        if (this.activeACL) {
          parent.postMessage(message, this.activeACL);
        } else {
          this.acls.forEach(function (uri) {
            return parent.postMessage(message, uri);
          });
        }
      }
    }

    /**
    * Verify the challange made to the parent frame.
    * @param {string} secretAttempt - The secret string to verify
    */

  }, {
    key: 'verifyChallenge',
    value: function verifyChallenge(secretAttempt) {
      var _this2 = this;

      var authorize = function authorize() {
        _this2.acls = ['*'];
        _this2.authorizeConsumer();
      };

      if (typeof this.secret === 'string' && (0, _string.fixedTimeCompare)(this.secret, secretAttempt)) {
        authorize();
      } else if (typeof this.secret === 'function') {
        this.secret.call(this, secretAttempt).then(authorize);
      }
    }

    /**
    * Authorize the parent frame by unhiding the container.
    */

  }, {
    key: 'authorizeConsumer',
    value: function authorizeConsumer() {
      document.documentElement.removeAttribute('hidden');

      // Emit a ready event
      this.emit('xfc.ready');
      this.JSONRPC.notification('authorized', [{ url: window.location.href }]);

      // If there is an onReady callback, execute it
      if (typeof this.onReady === 'function') {
        this.onReady.call(this);
      }
    }

    /**
     * Emit the given error
     * @param  {object} error - an error object containing error code and error message
     */

  }, {
    key: 'emitError',
    value: function emitError(error) {
      this.emit('xfc.error', error);
    }
  }]);

  return Application;
}(_events.EventEmitter);

exports.default = Application;