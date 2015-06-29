var RtcServer, easyrtc,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

easyrtc = require('easyrtc');

RtcServer = (function() {
  RtcServer.prototype.appName = 'vivo-cupido-4g';

  RtcServer.prototype.defaultRoomName = 'vivo-cupido-4g';

  RtcServer.prototype.appObj = null;

  function RtcServer() {
    this.onRoomLeave = bind(this.onRoomLeave, this);
    this.onDisconnect = bind(this.onDisconnect, this);
    this.onConnection = bind(this.onConnection, this);
    this.onAppCreated = bind(this.onAppCreated, this);
    this.onStartUpComplete = bind(this.onStartUpComplete, this);
    easyrtc.setOption('demosEnable', false);
    easyrtc.setOption('roomAutoCreateEnable', true);
    easyrtc.setOption('roomDefaultEnable', false);
  }

  RtcServer.prototype.listen = function(httpApp, socketServer, options) {
    if (options == null) {
      options = null;
    }
    socketServer.sockets.on("connection", function(socket) {});
    return easyrtc.listen(httpApp, socketServer, options, this.onStartUpComplete);
  };

  RtcServer.prototype.onStartUpComplete = function(err, pub) {
    pub.createApp(this.appName, null, this.onAppCreated);
    this.connect = pub.events.defaultListeners.connection;
    this.disconnect = pub.events.defaultListeners.disconnect;
    this.roomLeave = pub.events.defaultListeners.roomLeave;
    easyrtc.events.on('connection', this.onConnection);
    easyrtc.events.on('disconnect', this.onDisconnect);
    return easyrtc.events.on('roomLeave', this.onRoomLeave);
  };

  RtcServer.prototype.onAppCreated = function(err, appObj) {
    return this.appObj = appObj;
  };

  RtcServer.prototype.onConnection = function(socket, easyrtcid, next) {
    this.connect(socket, easyrtcid, next);
    return console.log("------>>>>> " + easyrtcid + " has connected");
  };

  RtcServer.prototype.onDisconnect = function(connectionObj, next) {
    this.disconnect(connectionObj, next);
    return console.log("------>>>>> " + (connectionObj.getEasyrtcid()) + " has disconnected");
  };

  RtcServer.prototype.onRoomLeave = function(connectionObj, roomName, next) {
    console.log("Leaving room " + roomName);
    return connectionObj.room(roomName, (function(_this) {
      return function(err, roomConnection) {
        return _this.roomLeave(connectionObj, roomName, function(err) {
          var room;
          next(err);
          room = roomConnection.getRoom();
          return room.getConnectionCount(function(err, count) {
            console.log("Room " + roomName + " has " + count + " connection(s)");
            if (count === 0) {
              return _this.appObj.deleteRoom(roomName, function(err, result) {
                return console.log("Result of deleting a room: " + result);
              });
            }
          });
        });
      };
    })(this));
  };

  return RtcServer;

})();

module.exports = new RtcServer;
