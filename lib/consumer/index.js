'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _frame = require('./frame');

var _frame2 = _interopRequireDefault(_frame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Add the given event handler to an EventEmitter instance
 * @param {EventEmitter} emitter - an instance of EventEmitter
 * @param {string} event - event name
 * @param {function} handler - event handler function
 */
function addEventHandler(emitter, event, handler) {
  if (typeof handler === 'function') {
    emitter.on(event, handler);
  }
}

var Consumer = {
  /**
   * Initialize a consumer.
   * @param  {Array}  globalHandlers - an object containing event handlers that apply to all frames.
   * @example
   * // Each key/value pair in globalHandlers should be a pair of event name and event handler.
   * const handlers = {'eventA': function() {}, 'eventB': function() {}};
   * Consumer.init(handlers);
   */
  init: function init() {
    var globalHandlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this.globalHandlers = globalHandlers;
  },


  /**
  * Mount the given source as an application into the given container.
  * @param {object} container - The DOM element to append the mounted frame to.
  * @param {string} source - The source URL to load the app from.
  * @param {string} options - An optional parameter that contains optional configs
  * @return {Frame} Returns the application that was mounted.
  */
  mount: function mount(container, source) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var frame = new _frame2.default();
    frame.init(container, source, options);

    // Apply global handlers to the frame
    Object.keys(this.globalHandlers).forEach(function (event) {
      var handlers = _this.globalHandlers[event];

      // If 'handlers' is an array, apply each handler to frame
      if (Array.isArray(handlers)) {
        handlers.forEach(function (handler) {
          addEventHandler(frame, event, handler);
        });
      } else {
        addEventHandler(frame, event, handlers);
      }
    });

    frame.mount();

    return frame;
  }
};

exports.default = Consumer;