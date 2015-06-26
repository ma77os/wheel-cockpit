// Generated by CoffeeScript 1.9.0
var Id, Rooms;

require('array-sugar');

Id = require('./Id');

Rooms = (function() {
  function Rooms() {}

  Rooms.rooms = {};

  Rooms.maximumNumberOfClients = 2;

  Rooms.getAvailableRoom = function() {
    var id;
    id = new Id;
    while (!(this.rooms[id] == null)) {
      id = new Id;
    }
    id = id.valueOf();
    this.rooms[id] = 1;
    return id;
  };

  Rooms.roomExists = function(id) {
    return this.rooms[id] != null;
  };

  Rooms.isRoomAvailable = function(id) {
    return this.rooms[id] < this.maximumNumberOfClients;
  };

  Rooms.increaseRoomCount = function(id) {
    return this.rooms[id]++;
  };

  Rooms.decreaseRoomCount = function(id) {
    return this.rooms[id]--;
  };

  Rooms.isRoomEmpty = function(id) {
    return this.rooms[id] === 0;
  };

  Rooms.remove = function(id) {
    return delete this.rooms[id];
  };

  return Rooms;

})();

module.exports = Rooms;