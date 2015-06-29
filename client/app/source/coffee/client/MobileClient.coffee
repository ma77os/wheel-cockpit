Client = require './Client.coffee'

# A class that handles connections and messages from other clients to the mobile client.
class MobileClient extends Client
	constructor: (config) ->
		super config
		@roomName = config.defaultRoomName

	# Connects to the EasyRTC signaling server.
	connect:(roomName) ->
		@roomName = roomName
		@addMessageListeners()
		@rtc.setDisconnectListener @onDisconnect

		@rtc.setServer(@roomName)
		@rtc.connect @appName, @onConnectSuccess, @onConnectError

		@connectTimeout = setTimeout =>
			@manualDisconnect = yes
			@rtc.disconnect()
		, 10000

	# Sends a message of the given type (with the given data) to the target room this client has joined.
	sendMessage: (msgType, msgData) ->
		@rtc.sendMessage {"targetRoom": @roomName}, msgType, msgData

	# Adds callbacks for all message types sent from another client (peer to peer or via websockets).
	addMessageListeners: ->
		@rtc.setListener @onDataSaverEnable, @messages.DATA_SAVER_ENABLE
		@rtc.setListener @onConnectionAcknowledged, @messages.PEER_CONNECTION_ACKNOWLEDGED
		@rtc.setListener @onPeerConnectionLost, @messages.PEER_CONNECTION_LOST
		@rtc.setListener @onDesktopLoaded, @messages.DESKTOP_LOADED
		
	onDesktopLoaded: (msgType, msgData) =>
		@notify @messages.DESKTOP_LOADED

	onConnectionAcknowledged: (who, msgType, msgData) =>
		@notify @messages.PEER_CONNECTION_SUCCESS
		@checkPeerConnectionStatus()

	checkPeerConnectionStatus: =>
		@peerConnectionStatusTime = setInterval =>
			if @rtc.getRoomOccupantsAsArray(@roomName).length < 2
				clearInterval @peerConnectionStatusTime
				@notify @messages.PEER_CONNECTION_LOST
		, 1000

	# Called when a successful connection to the EasyRTC signaling server was established.
	onConnectSuccess: (myId) =>
		clearTimeout @connectTimeout
		@notify @messages.SERVER_CONNECTION_SUCCESS

	# Called when a connection to the EasyRTC signaling server could not be established.
	onConnectError: (errorCode, errorText) =>
		clearTimeout @connectTimeout
		@notify @messages.SERVER_CONNECTION_FAILURE

	# Overrides base class method.
	onRoomListSuccess: (roomName, roomMap) =>
		# console.log "onRoomListSuccess: ", roomMap, roomName 
		if not roomMap[roomName]?
			@notify @messages.INVALID_ROOM, roomName
			return null
		else if roomMap[roomName]["numberClients"] > 1
			@notify @messages.FULL_ROOM, roomName
			return null
		else
			return roomName

	# Overrides base class method.
	onRoomListFailure: (roomName, errorCode, errorText) =>
		@notify @messages.UNABLE_TO_RETRIEVE_ROOM_LIST

	# Overrides base class method.
	onRoomJoinSuccess: (roomName) =>
		@roomName = roomName
		@rtc.sendMessage {'targetRoom': roomName}, @messages.PEER_CONNECTION, null
		@notify @messages.ROOM_JOIN_SUCCESS, roomName
	
	# Overrides base class method.
	onRoomJoinFailure: (errorCode, errorText, roomName) =>
		@notify @messages.ROOM_JOIN_FAILURE, roomName

	# Overrides base class method.
	onRoomLeaveSuccess: (roomName) =>
		clearInterval @peerConnectionStatusTime
		@notify @messages.ROOM_LEAVE_SUCCESS, roomName

	# Overrides base class method.
	onRoomLeaveFailure: (errorCode, errorText, roomName) =>
		@notify @messages.ROOM_LEAVE_FAILURE, roomName

	# Callback for socket disconnection by external reasons.
	onDisconnect: =>
		if @manualDisconnect
			@notify @messages.DATA_SAVER_ENABLE
			@manualDisconnect = no
		else
			clearInterval @peerConnectionStatusTime
			@notify @messages.SERVER_DISCONNECT

	# Parses the current URL, looking for the room name in a query string of the form "q=[value]".
	getRoomName: ->
		regex = new RegExp /[\?&]q=([^&#]*)/gi
		found = regex.exec window.location.search
		if found then window.decodeURIComponent(found[1].replace /\+/g, '') else ''

module.exports = MobileClient