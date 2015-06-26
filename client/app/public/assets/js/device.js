(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Device, Wheel;

Wheel = require('./device/Wheel');

Device = (function() {
  function Device() {}

  Device.init = function() {
    console.log("Device init");
    return this.build();
  };

  Device.build = function() {
    this.container = $("<div/>").attr("id", "device-wrap");
    this.wheel = new Wheel();
    this.container.append(this.wheel.container);
    return $("body").append(this.container);
  };

  return Device;

})();

Device.init();



},{"./device/Wheel":2}],2:[function(require,module,exports){
var Wheel;

Wheel = (function() {
  Wheel.prototype.rotation = 0;

  function Wheel() {
    this.container = $("<div/>").addClass('wheel');
    this.update();
  }

  Wheel.prototype.update = function() {
    this.rotation += 1;
    this.transformStr = "translate3d(-50%, -50%, 0)";
    this.transformStr += "rotateZ(" + this.rotation + "deg)";
    this.container.css('transform', this.transformStr);
    return window.requestAnimationFrame(this.update.bind(this));
  };

  return Wheel;

})();

module.exports = Wheel;



},{}]},{},[1]);
