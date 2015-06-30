(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CarView, Desktop, DesktopClient, Pairing;

DesktopClient = require('./client/DesktopClient.coffee');

Pairing = require('./desktop/Pairing');

CarView = require('./desktop/CarView');

Desktop = (function() {
  function Desktop() {}

  Desktop.init = function() {
    console.log("desktop init");
    return this.build();
  };

  Desktop.build = function() {
    this.container = $("<div/>").attr("id", "desktop-wrap");
    this.pairing = new Pairing();
    this.container.append(this.pairing.container);
    $("body").append(this.container);
    return this.initClient();
  };

  Desktop.initClient = function() {
    Desktop.client = new DesktopClient({});
    Desktop.client.subscribe(Desktop.client.messages.SERVER_CONNECTION_SUCCESS, function() {
      return console.log("SERVER_CONNECTION_SUCCESS");
    });
    Desktop.client.subscribe(Desktop.client.messages.SERVER_DISCONNECT, function() {
      return console.log("SERVER_DISCONNECT");
    });
    Desktop.client.subscribe(Desktop.client.messages.PEER_CONNECTION_LOST, function() {
      console.log("PEER_CONNECTION_LOST");
      return Desktop.client.disconnect();
    });
    Desktop.client.subscribe(Desktop.client.messages.PEER_CONNECTION_SUCCESS, function() {
      console.log("PEER_CONNECTION_SUCCESS");
      return Desktop.goApplication();
    });
    Desktop.client.subscribe(Desktop.client.messages.START_ALL, function() {
      return console.log("START ALL");
    });
    Desktop.client.subscribe(Desktop.client.messages.ROOM_JOIN_SUCCESS, function(messageType, roomName) {
      Desktop.currentRoom = roomName;
      return $(window).trigger("print-code", [Desktop.currentRoom]);
    });
    Desktop.client.subscribe(Desktop.client.messages.INTERACTION, function(messageType, data) {
      return $(window).trigger("update-move", data);
    });
    return Desktop.client.connect();
  };

  Desktop.goApplication = function() {
    Desktop.container.empty();
    Desktop.pairing = new CarView();
    return Desktop.container.append(Desktop.pairing.container);
  };

  return Desktop;

})();

Desktop.init();



},{"./client/DesktopClient.coffee":3,"./desktop/CarView":4,"./desktop/Pairing":5}],2:[function(require,module,exports){
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



},{"../utils/Rtc.coffee":9}],3:[function(require,module,exports){
var Client, DesktopClient, Id,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Client = require('./Client.coffee');

Id = require('../utils/Id.coffee');

DesktopClient = (function(superClass) {
  extend(DesktopClient, superClass);

  function DesktopClient(config) {
    this.onDisconnect = bind(this.onDisconnect, this);
    this.onRoomJoinFailure = bind(this.onRoomJoinFailure, this);
    this.onVisibilityState = bind(this.onVisibilityState, this);
    this.onRoomJoinSuccess = bind(this.onRoomJoinSuccess, this);
    this.onRoomListFailure = bind(this.onRoomListFailure, this);
    this.onRoomListSuccess = bind(this.onRoomListSuccess, this);
    this.onConnectError = bind(this.onConnectError, this);
    this.onConnectSuccess = bind(this.onConnectSuccess, this);
    this.checkConnection = bind(this.checkConnection, this);
    this.checkPeerConnectionStatus = bind(this.checkPeerConnectionStatus, this);
    this.onPeerConnection = bind(this.onPeerConnection, this);
    this.onPeerConnectionSuccess = bind(this.onPeerConnectionSuccess, this);
    this.onInitApp = bind(this.onInitApp, this);
    this.onMobileLoaded = bind(this.onMobileLoaded, this);
    this.onRestartApplication = bind(this.onRestartApplication, this);
    this.onInteraction = bind(this.onInteraction, this);
    DesktopClient.__super__.constructor.call(this, config);
    this.peerId = '';
    this.roomName = '';
  }

  DesktopClient.prototype.connect = function() {
    this.addMessageListeners();
    this.rtc.setDisconnectListener(this.onDisconnect);
    return this.rtc.connect(this.appName, this.onConnectSuccess, this.onConnectError);
  };

  DesktopClient.prototype.sendMessage = function(msgType, msgData) {
    return this.rtc.sendMessage(this.peerId, msgType, msgData);
  };

  DesktopClient.prototype.addMessageListeners = function() {
    this.rtc.setListener(this.onPeerConnection, this.messages.PEER_CONNECTION);
    this.rtc.setListener(this.onPeerConnectionSuccess, this.messages.PEER_CONNECTION_SUCCESS);
    this.rtc.setListener(this.onPeerConnectionLost, this.messages.PEER_CONNECTION_LOST);
    this.rtc.setListener(this.onInitApp, this.messages.START_ALL);
    this.rtc.setListener(this.onRestartApplication, this.messages.RESTART_APPLICATION);
    this.rtc.setListener(this.onMobileLoaded, this.messages.MOBILE_LOADED);
    return this.rtc.setListener(this.onInteraction, this.messages.INTERACTION);
  };

  DesktopClient.prototype.onInteraction = function(msgType, msgData, data) {
    return this.notify(this.messages.INTERACTION, data);
  };

  DesktopClient.prototype.onRestartApplication = function(msgType, msgData) {
    return this.notify(this.messages.RESTART_APPLICATION);
  };

  DesktopClient.prototype.onMobileLoaded = function(msgType, msgData) {
    return this.notify(this.messages.MOBILE_LOADED);
  };

  DesktopClient.prototype.onInitApp = function(who, msgType, msgData) {
    return this.notify(this.messages.START_ALL);
  };

  DesktopClient.prototype.onPeerConnectionSuccess = function(who, msgType, msgData) {
    this.peerId = who;
    this.rtc.sendMessage(this.peerId, this.messages.PEER_CONNECTION_ACKNOWLEDGED, 'Connection acknowledged');
    this.notify(this.messages.PEER_CONNECTION_SUCCESS);
    return this.checkPeerConnectionStatus();
  };

  DesktopClient.prototype.onPeerConnection = function(who, msgType, msgData) {};

  DesktopClient.prototype.checkPeerConnectionStatus = function() {
    return this.peerConnectionStatusTime = setInterval((function(_this) {
      return function() {
        if (_this.rtc.getRoomOccupantsAsArray(_this.roomName).length < 2) {
          clearInterval(_this.peerConnectionStatusTime);
          return _this.notify(_this.messages.PEER_CONNECTION_LOST);
        }
      };
    })(this), 1000);
  };

  DesktopClient.prototype.checkConnection = function() {
    return this.connectionStatusTime = setInterval((function(_this) {
      return function() {
        var socket;
        socket = _this.getSocket();
        if (socket === 0 || socket.disconnected) {
          clearInterval(_this.connectionStatusTime);
          return _this.rtc.connect(_this.appName, _this.onConnectSuccess, _this.onConnectError);
        }
      };
    })(this), 1000);
  };

  DesktopClient.prototype.onConnectSuccess = function(myId) {
    this.notify(this.messages.SERVER_CONNECTION_SUCCESS);
    return this.joinRoom(null, null);
  };

  DesktopClient.prototype.onConnectError = function(errorCode, errorText) {
    return this.notify(this.messages.SERVER_CONNECTION_FAILURE);
  };

  DesktopClient.prototype.onRoomListSuccess = function(roomName, roomMap) {
    var id;
    id = new Id(null, 3).valueOf();
    while (!(roomMap[id] == null)) {
      id = new Id(null, 3).valueOf();
    }
    return id;
  };

  DesktopClient.prototype.onRoomListFailure = function(roomName, errorCode, errorText) {
    return this.notify(this.messages.UNABLE_TO_RETRIEVE_ROOM_LIST);
  };

  DesktopClient.prototype.onRoomJoinSuccess = function(roomName) {
    this.roomName = roomName;
    this.notify(this.messages.ROOM_JOIN_SUCCESS, roomName);
    return this.checkConnection();
  };

  DesktopClient.prototype.onVisibilityState = function() {
    if (document.visibilityState === this.hidden) {
      return this.notify(this.messages.VISIBILITY_CHANGE);
    }
  };

  DesktopClient.prototype.onRoomJoinFailure = function(errorCode, errorText, roomName) {
    return this.notify(this.messages.ROOM_JOIN_FAILURE, roomName);
  };

  DesktopClient.prototype.onDisconnect = function() {
    clearInterval(this.peerConnectionStatusTime);
    return this.notify(this.messages.SERVER_DISCONNECT);
  };

  return DesktopClient;

})(Client);

module.exports = DesktopClient;



},{"../utils/Id.coffee":7,"./Client.coffee":2}],4:[function(require,module,exports){
var CarView, World,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

World = require('./simulation/World');

CarView = (function() {
  function CarView() {
    this.updateMove = bind(this.updateMove, this);
    $(window).on("update-move", this.updateMove);
    this.build();
  }

  CarView.prototype.build = function() {
    this.container = $("<div/>").addClass('container');
    return this.world = new World(this.container);
  };

  CarView.prototype.updateMove = function(event, data) {
    return this.world.updateCar(data);
  };

  return CarView;

})();

module.exports = CarView;



},{"./simulation/World":6}],5:[function(require,module,exports){
var Pairing,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Pairing = (function() {
  function Pairing() {
    this.printCode = bind(this.printCode, this);
    $(window).on("print-code", this.printCode);
    this.build();
  }

  Pairing.prototype.build = function() {
    this.container = $("<div/>").addClass('container');
    this.boxInfo = $("<div/>").addClass('box-info');
    this.descPage = $('<span/>').addClass('desc-text');
    this.boxInfo.append(this.descPage);
    return this.container.append(this.boxInfo);
  };

  Pairing.prototype.printCode = function(event, code) {
    return $('.desc-text').html("Digite o código abaixo: <br> " + code);
  };

  return Pairing;

})();

module.exports = Pairing;



},{}],6:[function(require,module,exports){
var World,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

World = (function() {
  World.prototype.speed = -0.01;

  World.prototype.accel = 0;

  World.prototype.vx = 0;

  World.prototype.vz = 0;

  World.prototype.angleDest = 0;

  World.prototype.angle = 0;

  World.prototype.FRICTION = 0.9;

  function World(container) {
    this.container = container;
    this.resize = bind(this.resize, this);
    this.buildScene();
    this.buildRoad();
    $(window).on('resize', this.resize);
    this.resize();
    this.render();
  }

  World.prototype.buildScene = function() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, $(window).width() / $(window).height(), 0.1, 1000);
    this.camera.position.y = 1;
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer();
    return this.container.append(this.renderer.domElement);
  };

  World.prototype.buildRoad = function() {
    var geom, material;
    geom = new THREE.PlaneGeometry(500, 500, 250, 250);
    material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      wireframe: true
    });
    this.floor = new THREE.Mesh(geom, material);
    this.floor.rotation.x = Math.PI / 2;
    return this.scene.add(this.floor);
  };

  World.prototype.updateCar = function(data) {
    this.angleDest = data.rotation * 0.1;
    return this.accel = data.accel * 0.001;
  };

  World.prototype.render = function() {
    window.requestAnimationFrame(this.render.bind(this));
    this.angle += (this.angleDest - this.angle) * 0.01;
    this.speed += this.accel;
    this.speed *= this.FRICTION;
    this.vx = Math.sin(this.angle) * this.speed;
    this.vz = Math.cos(this.angle) * this.speed;
    this.camera.position.x += this.vx;
    this.camera.position.z += this.vz;
    this.camera.rotation.y = this.angle;
    return this.renderer.render(this.scene, this.camera);
  };

  World.prototype.resize = function() {
    return this.renderer.setSize($(window).width(), $(window).height());
  };

  return World;

})();

module.exports = World;



},{}],7:[function(require,module,exports){
var Id;

Id = (function() {
  function Id(chars, length) {
    var charsLength, i, j, ref, value;
    chars = chars || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
    length = length || 4;
    value = new Array(length);
    charsLength = chars.length;
    for (i = j = 0, ref = length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      value[i] = chars[Math.floor(Math.random() * charsLength)];
    }
    this.value = value.join('');
  }

  Id.prototype.valueOf = function() {
    return this.value;
  };

  return Id;

})();

module.exports = Id;



},{}],8:[function(require,module,exports){
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



},{}],9:[function(require,module,exports){
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



},{"../utils/QueryString":8}]},{},[1]);
