Rtc = require '../utils/Rtc.coffee'

# Base class for hotsite/second_screen client classes.
# Classes interested in being notified of any messages provided by this class should subscribe to it.

class Client

	# All the messages emitted by this client.
	messages:
		PEER_CONNECTION: '#peer_connection'
		PEER_CONNECTION_SUCCESS: '#peer_connection_success'
		PEER_CONNECTION_LOST: '#peer_connection_lost'
		PEER_CONNECTION_ACKNOWLEDGED: '#peer_connection_acknowledged'
		SERVER_CONNECTION_SUCCESS: '#server_connection_success'
		SERVER_CONNECTION_FAILURE: '#server_connection_failure'
		SERVER_DISCONNECT: '#server_disconnect'
		DATA_SAVER_ENABLE: '#data_saver_enable'
		INVALID_ROOM: '#invalid_room'
		FULL_ROOM: '#full_room'
		UNABLE_TO_RETRIEVE_ROOM_LIST: '#unable_to_retrieve_room_list'
		ROOM_JOIN_SUCCESS: '#roomJoinSuccess'
		ROOM_JOIN_FAILURE: '#roomJoinFailure'
		ROOM_LEAVE_SUCCESS: '#roomLeaveSuccess'
		ROOM_LEAVE_FAILURE: '#roomLeaveFailure'
		DESKTOP_LOADED: '#desktopLoaded'
		MOBILE_LOADED: '#mobileLoaded'
		LOADED_AND_READY: '#loadedAndReady'
		RESTART_APPLICATION: '#restartApplication'
		START_ALL: '#start_all'
		INTERACTION: '#interaction'

	subscribers: []

	constructor: (config) ->
		@rtc = new Rtc config.roomName
		@appName = config?.appName? or 'audi-panel'
		@defaultRoomName = config?.defaultRoomName? or 'audi-panel'

	# Joins the given room name.
	joinRoom: (roomName, roomParams) ->
		@rtc.getRoomList (roomMap) =>
			roomName = @onRoomListSuccess roomName, roomMap
			if roomName then @rtc.joinRoom roomName, roomParams, @onRoomJoinSuccess, @onRoomJoinFailure
		, (errorCode, errorText) =>
			@onRoomListFailure roomName, errorCode, errorText

	# Leaves the given room name
	leaveRoom: (roomName) ->
		@rtc.leaveRoom roomName, @onRoomLeaveSuccess, @onRoomLeaveFailure

	disconnect: =>
		@rtc.disconnect()

	# Child classes should implement this callback, which is called when successfully retrieving a list of rooms.
	# Called with a room name and a map of rooms of the form {roomName: {"roomName": String, "numberClients": Number}}.
	# It should return a room name or null.
	onRoomListSuccess: (roomName, roomMap) =>

	# Child classes should implement this callback, which is called when a map of existent rooms could not be retrieved.
	onRoomListFailure: (roomName, errorCode, errorText) =>

	# Child classes should implement this callback, which is called when successfully joining a room.
	onRoomJoinSuccess: (roomName) =>
		console.log "onRoomJoinSuccess: ", roomName

	# Child classes should implement this callback, which is called when the client could not join a room.
	onRoomJoinFailure: (errorCode, errorText, roomName) =>
		console.log "onRoomJoinFailure: ", errorCode, errorText, roomName

	# Child classes should implement this callback, which is called when successfully leaving a room.
	onRoomLeaveSuccess: (roomName) =>

	# Child classes should implement this callback, which is called when the client could not leave a room.
	onRoomLeaveFailure: (errorCode, errorText, roomName) =>

	# Subscribes callback functions that will be invoked when the given message type (one of the above) occurs.
	subscribe: (messageType, callback) ->
		@subscribers.push
			'messageType': messageType
			'callback': callback

	# Invokes all subscribed callback functions for the given message type (one of the above).
	notify: (messageType, messageData = null) ->
		subscriber.callback(messageType, messageData) for subscriber in @subscribers when subscriber.messageType is messageType

	getSocket: ->
		@rtc.getSocket()

module.exports = Client