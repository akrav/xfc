'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateHeight = calculateHeight;
exports.calculateWidth = calculateWidth;

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getComputedStyle(prop) {
  var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;

  var result = null;
  if ('getComputedStyle' in window) {
    result = window.getComputedStyle(el, null);
  } else {
    result = document.defaultView.getComputedStyle(el, null);
  }
  return result !== null ? parseInt(result[prop], 10) : 0;
}

function getAllMeasures(dimension) {
  return [dimension.bodyOffset(), dimension.bodyScroll(), dimension.documentElementOffset(), dimension.documentElementScroll()];
}

var getHeight = {
  bodyOffset: function bodyOffset() {
    return document.body.offsetHeight + getComputedStyle('marginTop') + getComputedStyle('marginBottom');
  },

  bodyScroll: function bodyScroll() {
    return document.body.scrollHeight;
  },

  documentElementOffset: function documentElementOffset() {
    return document.documentElement.offsetHeight;
  },

  documentElementScroll: function documentElementScroll() {
    return document.documentElement.scrollHeight;
  },

  max: function max() {
    return Math.max.apply(Math, _toConsumableArray(getAllMeasures(getHeight)));
  },

  min: function min() {
    return Math.min.apply(Math, _toConsumableArray(getAllMeasures(getHeight)));
  }
};

var getWidth = {
  bodyOffset: function bodyOffset() {
    return document.body.offsetWidth;
  },

  bodyScroll: function bodyScroll() {
    return document.body.scrollWidth;
  },

  documentElementOffset: function documentElementOffset() {
    return document.documentElement.offsetWidth;
  },

  documentElementScroll: function documentElementScroll() {
    return document.documentElement.scrollWidth;
  },

  scroll: function scroll() {
    return Math.max(getWidth.bodyScroll(), getWidth.documentElementScroll());
  },

  max: function max() {
    return Math.max.apply(Math, _toConsumableArray(getAllMeasures(getWidth)));
  },

  min: function min() {
    return Math.min.apply(Math, _toConsumableArray(getAllMeasures(getWidth)));
  }
};

function calculateHeight() {
  var calMethod = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'bodyOffset';

  if (!(calMethod in getHeight)) {
    _logger2.default.error('\'' + calMethod + '\' is not a valid method name!');
  }
  return getHeight[calMethod]();
}

function calculateWidth() {
  var calMethod = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'scroll';

  if (!(calMethod in getWidth)) {
    _logger2.default.error('\'' + calMethod + '\' is not a valid method name!');
  }
  return getWidth[calMethod]();
}