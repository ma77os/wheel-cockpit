(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DeviceDetector, Main, QueryString, ScriptLoader;

QueryString = require('./utils/QueryString.coffee');

ScriptLoader = require('./utils/ScriptLoader.coffee');

DeviceDetector = require('./utils/DeviceDetector.coffee');

Main = (function() {
  function Main() {}

  Main.createClient = function() {
    var deviceDetector, url;
    deviceDetector = new DeviceDetector(window.navigator.userAgent);
    window.servers = [
      {
        name: "A",
        uri: "http://10.246.9.121:5000"
      }
    ];
    window.isMobile = deviceDetector.isMobile();
    window.isTablet = deviceDetector.isTablet();
    window.isDevice = window.isMobile || window.isTablet;
    window.experienceCompatible = (!!Modernizr.peerconnection || !!Modernizr.websockets) && !!Modernizr.audio && !!Modernizr.canvas;
    url = window.isDevice ? "assets/js/device.js" : "assets/js/desktop.js";
    return ScriptLoader.load(url);
  };

  return Main;

})();

Main.createClient();



},{"./utils/DeviceDetector.coffee":2,"./utils/QueryString.coffee":3,"./utils/ScriptLoader.coffee":4}],2:[function(require,module,exports){
var DeviceDetector;

DeviceDetector = (function() {
  function DeviceDetector(userAgent) {
    this.mobileDetect = new MobileDetect(userAgent);
  }

  DeviceDetector.prototype.mobile = function() {
    return this.mobileDetect.mobile();
  };

  DeviceDetector.prototype.isMobile = function() {
    return this.mobileDetect.is(this.mobileDetect.os());
  };

  DeviceDetector.prototype.isAndroid = function() {
    return this.mobileDetect.os() === "AndroidOS";
  };

  DeviceDetector.prototype.isIOS = function() {
    return this.mobileDetect.os() === "iOS";
  };

  DeviceDetector.prototype.isTablet = function() {
    return this.mobileDetect.tablet() != null;
  };

  return DeviceDetector;

})();

module.exports = DeviceDetector;



},{}],3:[function(require,module,exports){
var QueryString;

QueryString = (function() {
  function QueryString() {}

  QueryString.hasParameter = function(name) {
    return location.search.indexOf(name) > -1;
  };

  QueryString.getParameterValue = function(name) {
    var regex, results;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    results = regex.exec(location.search);
    if (results != null) {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    } else {
      return "";
    }
  };

  return QueryString;

})();

module.exports = QueryString;



},{}],4:[function(require,module,exports){
var ScriptLoader;

ScriptLoader = (function() {
  function ScriptLoader() {}

  ScriptLoader.load = function(src, callback) {
    var done, script, t;
    script = document.createElement('script');
    script.src = src;
    done = false;
    script.onload = function() {
      if (!done && (!this.readyState || this.readyState === 'complete')) {
        done = true;
        return typeof callback === "function" ? callback() : void 0;
      }
    };
    t = document.getElementsByTagName('script')[0];
    return t.parentNode.insertBefore(script, t);
  };

  return ScriptLoader;

})();

module.exports = ScriptLoader;



},{}]},{},[1]);
