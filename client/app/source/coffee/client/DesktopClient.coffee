Client = require './Client.coffee'
Id = require '../utils/Id.coffee'

# A class that handles connections and messages from other clients to the desktop client.

class DesktopClient extends Client

	constructor: (config) ->
		super config
		@peerId = ''
		@roomName = ''

	# Connects to the EasyRTC signaling server.
	connect: ->
		@addMessageListeners()
		@rtc.setDisconnectListener @onDisconnect
		@rtc.connect @appName, @onConnectSuccess, @onConnectError

	# Sends a message of the given type (with the given data) to the target peer.
	sendMessage: (msgType, msgData) ->
		@rtc.sendMessage @peerId, msgType, msgData

	# Adds callbacks for all message types sent from another client (peer to peer or via websockets).
	addMessageListeners: ->
		@rtc.setListener @onPeerConnection, @messages.PEER_CONNECTION
		@rtc.setListener @onPeerConnectionSuccess, @messages.PEER_CONNECTION_SUCCESS
		@rtc.setListener @onPeerConnectionLost, @messages.PEER_CONNECTION_LOST
		@rtc.setListener @onInitApp, @messages.START_ALL
		@rtc.setListener @onRestartApplication, @messages.RESTART_APPLICATION
		@rtc.setListener @onMobileLoaded, @messages.MOBILE_LOADED
		@rtc.setListener @onInteraction, @messages.INTERACTION

	onInteraction: (msgType, msgData, data) =>
		@notify @messages.INTERACTION, data

	onRestartApplication: (msgType, msgData) =>
		@notify @messages.RESTART_APPLICATION

	onMobileLoaded: (msgType, msgData) =>
		@notify @messages.MOBILE_LOADED

	onInitApp: (who, msgType, msgData) =>
		@notify @messages.START_ALL

	# Called when another peer has established a connection to this client.
	onPeerConnectionSuccess: (who, msgType, msgData) =>
		@peerId = who
		@rtc.sendMessage @peerId, @messages.PEER_CONNECTION_ACKNOWLEDGED, 'Connection acknowledged'
		@notify @messages.PEER_CONNECTION_SUCCESS
		@checkPeerConnectionStatus()

	onPeerConnection: (who, msgType, msgData) =>
		# @peerId = who
		# @rtc.sendMessage @peerId, @messages.PEER_CONNECTION_ACKNOWLEDGED, 'Connection acknowledged'
		# @notify @messages.PEER_CONNECTION
		# @checkPeerConnectionStatus()

	checkPeerConnectionStatus: =>
		@peerConnectionStatusTime = setInterval =>
			if @rtc.getRoomOccupantsAsArray(@roomName).length < 2
				clearInterval @peerConnectionStatusTime
				@notify @messages.PEER_CONNECTION_LOST
		, 1000

	checkConnection: =>
		@connectionStatusTime = setInterval =>
			socket = @getSocket()
			if socket is 0 or socket.disconnected
				clearInterval @connectionStatusTime
				@rtc.connect @appName, @onConnectSuccess, @onConnectError
		, 1000

	# Called when a successful connection to the EasyRTC signaling server was established.
	onConnectSuccess: (myId) =>
		@notify @messages.SERVER_CONNECTION_SUCCESS
		@joinRoom null, null

	# Called when a connection to the EasyRTC signaling server could not be established.
	onConnectError: (errorCode, errorText) =>
		@notify @messages.SERVER_CONNECTION_FAILURE

	# Overrides base class method.
	onRoomListSuccess: (roomName, roomMap) =>
		# debugger
		id = new Id(null, 3).valueOf()
		id = new Id(null, 3).valueOf() until not roomMap[id]?
		# "#{id}#{window.server.name}"
		id

	# Overrides base class method.
	onRoomListFailure: (roomName, errorCode, errorText) =>
		# debugger
		@notify @messages.UNABLE_TO_RETRIEVE_ROOM_LIST

	# Overrides base class method.
	onRoomJoinSuccess: (roomName) =>
		# debugger
		@roomName = roomName
		@notify @messages.ROOM_JOIN_SUCCESS, roomName
		@checkConnection()

	onVisibilityState: =>
		if document.visibilityState is @hidden
			@notify @messages.VISIBILITY_CHANGE

	# Overrides base class method.
	onRoomJoinFailure: (errorCode, errorText, roomName) =>
		@notify @messages.ROOM_JOIN_FAILURE, roomName

	# Callback for socket disconnection by external reasons.
	onDisconnect: =>
		clearInterval @peerConnectionStatusTime
		@notify @messages.SERVER_DISCONNECT

module.exports = DesktopClient