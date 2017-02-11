var _ = require('lodash');

class Utils {

  constructor(){}

  static sendJSONres(res, status, content) {
    let contentToReturn;

    //check status param
    if(_isNotValidNumber(status) || status < 100 || status >= 600) {
      throw "Status must be a valid http status code  number";
    }

    //check content param
    //because content can be only String, Array, Object (all other types aren't permitted)
    if(_isNotStringArrayObject(content) ||
      _isNotAcceptableValue(content) || _.isDate(content) || _.isBoolean(content) ||
      _.isNumber(content)) {
      throw "Content must be either String, or Array, or Object (no Error, RegExp, and so on )";
    }

    res.status(status);
    res.contentType('application/json');

    if(status >= 400 && status < 600) {
      if(_.isString(content) || _.isArray(content)) {
        contentToReturn = {
          message : content
        };
      } else {
        contentToReturn = content;
      }
    } else {
      contentToReturn = content;
    }
    res.json(contentToReturn);
  }
}

// ---------- private functions that I can call inside this class ----------
function _isNotAcceptableValue(param) {
  return _.isFunction(param) || _isNotValidJavascriptObject(param) ||
   _.isNil(param) || _.isNaN(param);
}

function _isNotValidJavascriptObject(p) {
  return  _.isBuffer(p) || _.isError(p) ||
  _.isRegExp(p) ||  _.isSymbol(p) ||
  _isSet(p) || _isMap(p) || _isNotValidArray(p);
}

function _isNotValidArray(p) {
  return _.isArrayBuffer(p) || _.isTypedArray(p);
}

function _isNotValidNumber(p) {
  return !_.isNumber(p) || _.isNaN(p);
}

function _isNotStringArrayObject(p) {
  return !_isStringOrArrayOrObject(p);
}

function _isStringOrArrayOrObject(p) {
  return _.isString(p) || _.isArray(p) || _.isObject(p);
}

function _isSet(p) {
  return _.isSet(p) || _.isWeakSet(p);
}

function _isMap(p) {
  return _.isMap(p) || _.isWeakMap(p);
}

module.exports = Utils;
