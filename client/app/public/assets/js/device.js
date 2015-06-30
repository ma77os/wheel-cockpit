(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Device, MobileClient, Pairing, Wheel;

Wheel = require('./device/Wheel');

Pairing = require('./device/Pairing');

MobileClient = require('./client/MobileClient.coffee');

Device = (function() {
  function Device() {}

  Device.init = function() {
    console.log("Device init");
    $(window).on('room-name-setted', this.onRoomNameSetted);
    $(window).on('interact', this.onInteractDetected);
    return this.build();
  };

  Device.build = function() {
    this.setUp();
    this.container = $("<div/>").attr("id", "device-wrap");
    this.pairing = new Pairing();
    this.container.append(this.pairing.container);
    return $("body").append(this.container);
  };

  Device.initClient = function(roomName) {
    Device.currentRoomName = roomName;
    if (Device.client === null) {
      Device.setUp();
    }
    return Device.client.connect(Device.currentRoomName);
  };

  Device.setUp = function() {
    Device.client = new MobileClient({
      defaultRoomName: '',
      currentRoomName: Device.currentRoomName
    });
    Device.client.subscribe(Device.client.messages.SERVER_CONNECTION_SUCCESS, function() {
      console.log("SERVER_CONNECTION_SUCCESS");
      return Device.client.joinRoom(Device.currentRoomName, null);
    });
    Device.client.subscribe(Device.client.messages.START_ALL, function() {
      return console.log("START ALL");
    });
    Device.client.subscribe(Device.client.messages.ROOM_JOIN_SUCCESS, function(messageType, roomName) {
      Device.currentRoom = roomName;
      Device.client.sendMessage(Device.client.messages.PEER_CONNECTION_SUCCESS);
      return Device.initApp();
    });
    return Device.client.subscribe(Device.client.messages.PEER_CONNECTION_LOST, function() {
      console.log("PEER_CONNECTION_LOST");
      return Device.client.disconnect();
    });
  };

  Device.onInteractDetected = function(event, data) {
    return Device.client.sendMessage(Device.client.messages.INTERACTION, data);
  };

  Device.onRoomNameSetted = function(event, roomName) {
    return Device.initClient(roomName);
  };

  Device.initApp = function() {
    Device.container.empty();
    Device.wheel = new Wheel();
    return Device.container.append(Device.wheel.container);
  };

  return Device;

})();

Device.init();



},{"./client/MobileClient.coffee":3,"./device/Pairing":4,"./device/Wheel":5}],2:[function(require,module,exports){
var Client, Rtc,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Rtc = require('../utils/Rtc.coffee');

Client = (function() {
  Client.prototype.messages = {
    PEER_CONNECTION: '#peer_connection',
    PEER_CONNECTION_SUCCESS: '#peer_connection_success',
    PEER_CONNECTION_LOST: '#peer_connection_lost',
    PEER_CONNECTION_ACKNOWLEDGED: '#peer_connection_acknowledged',
    SERVER_CONNECTION_SUCCESS: '#server_connection_success',
    SERVER_CONNECTION_FAILURE: '#server_connection_failure',
    SERVER_DISCONNECT: '#server_disconnect',
    DATA_SAVER_ENABLE: '#data_saver_enable',
    INVALID_ROOM: '#invalid_room',
    FULL_ROOM: '#full_room',
    UNABLE_TO_RETRIEVE_ROOM_LIST: '#unable_to_retrieve_room_list',
    ROOM_JOIN_SUCCESS: '#roomJoinSuccess',
    ROOM_JOIN_FAILURE: '#roomJoinFailure',
    ROOM_LEAVE_SUCCESS: '#roomLeaveSuccess',
    ROOM_LEAVE_FAILURE: '#roomLeaveFailure',
    DESKTOP_LOADED: '#desktopLoaded',
    MOBILE_LOADED: '#mobileLoaded',
    LOADED_AND_READY: '#loadedAndReady',
    RESTART_APPLICATION: '#restartApplication',
    START_ALL: '#start_all',
    INTERACTION: '#interaction'
  };

  Client.prototype.subscribers = [];

  function Client(config) {
    this.onRoomLeaveFailure = bind(this.onRoomLeaveFailure, this);
    this.onRoomLeaveSuccess = bind(this.onRoomLeaveSuccess, this);
    this.onRoomJoinFailure = bind(this.onRoomJoinFailure, this);
    this.onRoomJoinSuccess = bind(this.onRoomJoinSuccess, this);
    this.onRoomListFailure = bind(this.onRoomListFailure, this);
    this.onRoomListSuccess = bind(this.onRoomListSuccess, this);
    this.disconnect = bind(this.disconnect, this);
    this.rtc = new Rtc(config.roomName);
    this.appName = ((config != null ? config.appName : void 0) != null) || 'audi-panel';
    this.defaultRoomName = ((config != null ? config.defaultRoomName : void 0) != null) || 'audi-panel';
  }

  Client.prototype.joinRoom = function(roomName, roomParams) {
    return this.rtc.getRoomList((function(_this) {
      return function(roomMap) {
        roomName = _this.onRoomListSuccess(roomName, roomMap);
        if (roomName) {
          return _this.rtc.joinRoom(roomName, roomParams, _this.onRoomJoinSuccess, _this.onRoomJoinFailure);
        }
      };
    })(this), (function(_this) {
      return function(errorCode, errorText) {
        return _this.onRoomListFailure(roomName, errorCode, errorText);
      };
    })(this));
  };

  Client.prototype.leaveRoom = function(roomName) {
    return this.rtc.leaveRoom(roomName, this.onRoomLeaveSuccess, this.onRoomLeaveFailure);
  };

  Client.prototype.disconnect = function() {
    return this.rtc.disconnect();
  };

  Client.prototype.onRoomListSuccess = function(roomName, roomMap) {};

  Client.prototype.onRoomListFailure = function(roomName, errorCode, errorText) {};

  Client.prototype.onRoomJoinSuccess = function(roomName) {
    return console.log("onRoomJoinSuccess: ", roomName);
  };

  Client.prototype.onRoomJoinFailure = function(errorCode, errorText, roomName) {
    return console.log("onRoomJoinFailure: ", errorCode, errorText, roomName);
  };

  Client.prototype.onRoomLeaveSuccess = function(roomName) {};

  Client.prototype.onRoomLeaveFailure = function(errorCode, errorText, roomName) {};

  Client.prototype.subscribe = function(messageType, callback) {
    return this.subscribers.push({
      'messageType': messageType,
      'callback': callback
    });
  };

  Client.prototype.notify = function(messageType, messageData) {
    var i, len, ref, results, subscriber;
    if (messageData == null) {
      messageData = null;
    }
    ref = this.subscribers;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      subscriber = ref[i];
      if (subscriber.messageType === messageType) {
        results.push(subscriber.callback(messageType, messageData));
      }
    }
    return results;
  };

  Client.prototype.getSocket = function() {
    return this.rtc.getSocket();
  };

  return Client;

})();

module.exports = Client;



},{"../utils/Rtc.coffee":7}],3:[function(require,module,exports){
var Client, MobileClient,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Client = require('./Client.coffee');

MobileClient = (function(superClass) {
  extend(MobileClient, superClass);

  function MobileClient(config) {
    this.onDisconnect = bind(this.onDisconnect, this);
    this.onRoomLeaveFailure = bind(this.onRoomLeaveFailure, this);
    this.onRoomLeaveSuccess = bind(this.onRoomLeaveSuccess, this);
    this.onRoomJoinFailure = bind(this.onRoomJoinFailure, this);
    this.onRoomJoinSuccess = bind(this.onRoomJoinSuccess, this);
    this.onRoomListFailure = bind(this.onRoomListFailure, this);
    this.onRoomListSuccess = bind(this.onRoomListSuccess, this);
    this.onConnectError = bind(this.onConnectError, this);
    this.onConnectSuccess = bind(this.onConnectSuccess, this);
    this.checkPeerConnectionStatus = bind(this.checkPeerConnectionStatus, this);
    this.onConnectionAcknowledged = bind(this.onConnectionAcknowledged, this);
    this.onDesktopLoaded = bind(this.onDesktopLoaded, this);
    MobileClient.__super__.constructor.call(this, config);
    this.roomName = config.defaultRoomName;
  }

  MobileClient.prototype.connect = function(roomName) {
    this.roomName = roomName;
    this.addMessageListeners();
    this.rtc.setDisconnectListener(this.onDisconnect);
    this.rtc.setServer(this.roomName);
    this.rtc.connect(this.appName, this.onConnectSuccess, this.onConnectError);
    return this.connectTimeout = setTimeout((function(_this) {
      return function() {
        _this.manualDisconnect = true;
        return _this.rtc.disconnect();
      };
    })(this), 10000);
  };

  MobileClient.prototype.sendMessage = function(msgType, msgData) {
    return this.rtc.sendMessage({
      "targetRoom": this.roomName
    }, msgType, msgData);
  };

  MobileClient.prototype.addMessageListeners = function() {
    this.rtc.setListener(this.onDataSaverEnable, this.messages.DATA_SAVER_ENABLE);
    this.rtc.setListener(this.onConnectionAcknowledged, this.messages.PEER_CONNECTION_ACKNOWLEDGED);
    this.rtc.setListener(this.onPeerConnectionLost, this.messages.PEER_CONNECTION_LOST);
    return this.rtc.setListener(this.onDesktopLoaded, this.messages.DESKTOP_LOADED);
  };

  MobileClient.prototype.onDesktopLoaded = function(msgType, msgData) {
    return this.notify(this.messages.DESKTOP_LOADED);
  };

  MobileClient.prototype.onConnectionAcknowledged = function(who, msgType, msgData) {
    this.notify(this.messages.PEER_CONNECTION_SUCCESS);
    return this.checkPeerConnectionStatus();
  };

  MobileClient.prototype.checkPeerConnectionStatus = function() {
    return this.peerConnectionStatusTime = setInterval((function(_this) {
      return function() {
        if (_this.rtc.getRoomOccupantsAsArray(_this.roomName).length < 2) {
          clearInterval(_this.peerConnectionStatusTime);
          return _this.notify(_this.messages.PEER_CONNECTION_LOST);
        }
      };
    })(this), 1000);
  };

  MobileClient.prototype.onConnectSuccess = function(myId) {
    clearTimeout(this.connectTimeout);
    return this.notify(this.messages.SERVER_CONNECTION_SUCCESS);
  };

  MobileClient.prototype.onConnectError = function(errorCode, errorText) {
    clearTimeout(this.connectTimeout);
    return this.notify(this.messages.SERVER_CONNECTION_FAILURE);
  };

  MobileClient.prototype.onRoomListSuccess = function(roomName, roomMap) {
    if (roomMap[roomName] == null) {
      this.notify(this.messages.INVALID_ROOM, roomName);
      return null;
    } else if (roomMap[roomName]["numberClients"] > 1) {
      this.notify(this.messages.FULL_ROOM, roomName);
      return null;
    } else {
      return roomName;
    }
  };

  MobileClient.prototype.onRoomListFailure = function(roomName, errorCode, errorText) {
    return this.notify(this.messages.UNABLE_TO_RETRIEVE_ROOM_LIST);
  };

  MobileClient.prototype.onRoomJoinSuccess = function(roomName) {
    this.roomName = roomName;
    this.rtc.sendMessage({
      'targetRoom': roomName
    }, this.messages.PEER_CONNECTION, null);
    return this.notify(this.messages.ROOM_JOIN_SUCCESS, roomName);
  };

  MobileClient.prototype.onRoomJoinFailure = function(errorCode, errorText, roomName) {
    return this.notify(this.messages.ROOM_JOIN_FAILURE, roomName);
  };

  MobileClient.prototype.onRoomLeaveSuccess = function(roomName) {
    clearInterval(this.peerConnectionStatusTime);
    return this.notify(this.messages.ROOM_LEAVE_SUCCESS, roomName);
  };

  MobileClient.prototype.onRoomLeaveFailure = function(errorCode, errorText, roomName) {
    return this.notify(this.messages.ROOM_LEAVE_FAILURE, roomName);
  };

  MobileClient.prototype.onDisconnect = function() {
    if (this.manualDisconnect) {
      this.notify(this.messages.DATA_SAVER_ENABLE);
      return this.manualDisconnect = false;
    } else {
      clearInterval(this.peerConnectionStatusTime);
      return this.notify(this.messages.SERVER_DISCONNECT);
    }
  };

  MobileClient.prototype.getRoomName = function() {
    var found, regex;
    regex = new RegExp(/[\?&]q=([^&#]*)/gi);
    found = regex.exec(window.location.search);
    if (found) {
      return window.decodeURIComponent(found[1].replace(/\+/g, ''));
    } else {
      return '';
    }
  };

  return MobileClient;

})(Client);

module.exports = MobileClient;



},{"./Client.coffee":2}],4:[function(require,module,exports){
var Pairing,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Pairing = (function() {
  function Pairing() {
    this.setRoomName = bind(this.setRoomName, this);
    this.setListeners = bind(this.setListeners, this);
    this.build();
    setTimeout((function(_this) {
      return function() {
        return _this.setListeners();
      };
    })(this), 1000);
  }

  Pairing.prototype.build = function() {
    this.container = $("<div/>").addClass('container');
    this.boxInfo = $("<div/>").addClass('box-info');
    this.descPage = $('<span/>').addClass('desc-text').text("Insira o código de pareamento:");
    this.inputPage = $('<input/>').addClass('input-code').attr("maxlength", 3);
    this.submitBt = $('<div/>').addClass('submit-bt').text("ENVIAR");
    this.boxInfo.append(this.descPage);
    this.boxInfo.append(this.inputPage);
    this.boxInfo.append(this.submitBt);
    return this.container.append(this.boxInfo);
  };

  Pairing.prototype.setListeners = function() {
    return $(".submit-bt").bind("click", this.setRoomName);
  };

  Pairing.prototype.setRoomName = function() {
    var roomName;
    roomName = $(".input-code").val();
    return $(window).trigger('room-name-setted', [roomName.toUpperCase()]);
  };

  return Pairing;

})();

module.exports = Pairing;



},{}],5:[function(require,module,exports){
var Wheel,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Wheel = (function() {
  Wheel.prototype.accel = 0;

  Wheel.prototype.rotation = 0;

  Wheel.prototype.rotationDest = 0;

  Wheel.prototype.deviceFactor = 1;

  Wheel.prototype.deviceFactorOffset = 1.5;

  Wheel.prototype.deviceFactorAndroid = 0.08;

  function Wheel() {
    this.onDeviceMotion = bind(this.onDeviceMotion, this);
    this.container = $("<div/>").addClass('container');
    this.imgCockpit = $('<img/>').addClass('cockpit').attr('src', 'assets/img/cockpit.jpg');
    this.imgWheel = $('<img/>').addClass('wheel').attr('src', 'assets/img/wheel.png');
    this.container.append(this.imgCockpit);
    this.container.append(this.imgWheel);
    if (window.DeviceMotionEvent !== void 0) {
      window.addEventListener("deviceorientation", this.onDeviceMotion);
    }
    this.update();
  }

  Wheel.prototype.onDeviceMotion = function(event) {
    if (event.rotationRate !== null) {
      this.rotationDest = (event.beta + this.deviceFactorOffset) * this.deviceFactor;
      return this.accel = event.gamma - 90;
    }
  };

  Wheel.prototype.update = function() {
    this.rotation = this.rotationDest;
    this.transformStr = "translate3d(-50%, 0, 0)";
    this.transformStr += "rotateZ(" + this.rotation + "deg)";
    this.imgCockpit.css('transform', this.transformStr);
    $(window).trigger('interact', {
      'rotation': this.rotation,
      'accel': this.accel
    });
    return window.requestAnimationFrame(this.update.bind(this));
  };

  return Wheel;

})();

module.exports = Wheel;



},{}],6:[function(require,module,exports){
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



},{}],7:[function(require,module,exports){
var QueryString, Rtc;

QueryString = require('../utils/QueryString');

Rtc = (function() {
  function Rtc(roomName) {
    this.servers = window.servers;
    this.setServer(roomName);
  }

  Rtc.prototype.setUp = function() {
    var i, j;
    if (typeof this.servers === "undefined" || this.servers.length === 0) {
      throw "Não existem Servidores configurados para a aplicação.";
    }
    if ((window.servers != null) && window.servers.length > 0) {
      for (i = j = 0; j < 3; i = ++j) {
        if ((window.servers[i] != null) && window.servers[i] !== "") {
          this.servers[i].name = window.servers[i];
        }
      }
    }
  };

  Rtc.prototype.connect = function(appName, successCallback, errorCallback) {
    if (easyrtc.webSocket != null) {
      easyrtc.useThisSocketConnection(easyrtc.webSocket);
    } else {
      easyrtc.setSocketUrl(this.servers[this.idServer].uri);
    }
    return easyrtc.connect(appName, successCallback, errorCallback);
  };

  Rtc.prototype.setServer = function(roomName) {
    var serverParameter;
    if (window.isSecondScreen) {
      if (roomName != null) {
        switch (roomName[3]) {
          case this.servers[0].name:
            return this.idServer = 0;
          case this.servers[1].name:
            return this.idServer = 1;
          case this.servers[2].name:
            return this.idServer = 2;
        }
      } else {
        serverParameter = QueryString.getParameterValue("ss");
        if (serverParameter && !isNaN(parseFloat(serverParameter)) && isFinite(serverParameter)) {
          return this.idServer = Number(serverParameter);
        }
      }
    } else {
      this.setUp();
      this.idServer = Math.floor(Math.random() * this.servers.length);
      return window.server = this.servers[this.idServer];
    }
  };

  Rtc.prototype.disconnect = function() {
    return easyrtc.disconnect();
  };

  Rtc.prototype.joinRoom = function(roomName, roomOptions, successCb, failureCb) {
    return easyrtc.joinRoom(roomName, roomOptions, successCb, failureCb);
  };

  Rtc.prototype.leaveRoom = function(roomName, successCb, failureCb) {
    return easyrtc.leaveRoom(roomName, successCb, failureCb);
  };

  Rtc.prototype.isPeerConnected = function(peerId) {
    return easyrtc.getConnectStatus(peerId) === easyrtc.IS_CONNECTED;
  };

  Rtc.prototype.getRoomOccupantsAsArray = function(roomName) {
    return easyrtc.getRoomOccupantsAsArray(roomName);
  };

  Rtc.prototype.isPeerInAnyRoom = function(peerId) {
    return easyrtc.isPeerInAnyRoom(peerId);
  };

  Rtc.prototype.setListener = function(callback, msgType) {
    return easyrtc.setPeerListener(callback, msgType);
  };

  Rtc.prototype.setDisconnectListener = function(callback) {
    return easyrtc.setDisconnectListener(callback);
  };

  Rtc.prototype.sendMessage = function(peer, msgType, msgData) {
    return easyrtc.sendPeerMessage(peer, msgType, msgData, function() {}, function() {});
  };

  Rtc.prototype.getRoomList = function(successCb, errorCb) {
    return easyrtc.getRoomList(successCb, errorCb);
  };

  Rtc.prototype.idToUsername = function(id) {
    return easyrtc.idToName(id);
  };

  Rtc.prototype.usernameToId = function(username) {
    var id;
    id = easyrtc.usernameToIds(username)[0];
    if (typeof id === 'undefined' || id === null) {
      return false;
    } else {
      return id.easyrtcid;
    }
  };

  Rtc.prototype.getSocket = function() {
    return easyrtc.webSocket;
  };

  return Rtc;

})();

module.exports = Rtc;



},{"../utils/QueryString":6}]},{},[1]);
