'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** URI class for parsing URIs */
var URI = function URI(uri) {
  _classCallCheck(this, URI);

  var a = document.createElement('a');
  a.href = uri;

  this.protocol = a.protocol;
  this.pathname = a.pathname;

  // In postMessage the default port for each protocol is stripped from
  // the event origin. Exclude it so the origins match up.
  var portMatch = this.protocol === 'http:' ? /(:80)$/ : /(:443)$/;
  this.host = a.host.replace(portMatch, '');

  this.origin = this.protocol + '//' + this.host;
};

exports.default = URI;