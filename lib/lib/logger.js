'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint no-console: 0 */
exports.default = {
  log: function log() {
    if (process.env.NODE_ENV !== 'production') {
      var _console;

      (_console = console).log.apply(_console, arguments);
    }
  },

  warn: function warn() {
    var _console2;

    return (_console2 = console).warn.apply(_console2, arguments);
  },
  error: function error() {
    var _console3;

    return (_console3 = console).error.apply(_console3, arguments);
  }
};