QueryString = require '../utils/QueryString'

# Wrapper class for the EasyRTC client API.
class Rtc

	constructor: (roomName) ->
		@servers = window.servers
		@setServer(roomName)

	setUp: ->
		if typeof @servers is "undefined" or @servers.length is 0
			throw "Não existem Servidores configurados para a aplicação."

		if window.servers? and window.servers.length > 0
			for i in [0...3]
				if window.servers[i]? and window.servers[i] isnt ""
					@servers[i].name = window.servers[i];

		return

	# Connects to the EasyRTC signaling server.
	connect: (appName, successCallback, errorCallback) ->
		if easyrtc.webSocket?
			easyrtc.useThisSocketConnection(easyrtc.webSocket)
		else
			easyrtc.setSocketUrl(@servers[@idServer].uri)

		easyrtc.connect appName, successCallback, errorCallback

	setServer:(roomName)->
		if window.isSecondScreen
			if roomName?
				switch roomName[3]
					when @servers[0].name
						@idServer = 0
					when @servers[1].name
						@idServer = 1
					when @servers[2].name
						@idServer = 2
			else
				serverParameter = QueryString.getParameterValue("ss");
				if serverParameter && !isNaN(parseFloat(serverParameter)) && isFinite(serverParameter)
					@idServer = Number serverParameter
		else
			@setUp()
			@idServer = Math.floor((Math.random() * @servers.length))
			window.server = @servers[@idServer]


	# Disconnects to EasyRTC server.
	disconnect:->
		easyrtc.disconnect()

	# Joins the given room name.
	# Note: The successCb and failureCb functions will solely be called if you are already connected to the server.
	joinRoom: (roomName, roomOptions, successCb, failureCb) ->
		easyrtc.joinRoom roomName, roomOptions, successCb, failureCb

	# Leaving a room is handled using this function, or through disconnecting.
	# Note: The successCb and failureCb functions will solely be called if you are already connected to the server.
	leaveRoom: (roomName, successCb, failureCb) ->
		easyrtc.leaveRoom roomName, successCb, failureCb

	# Checks whether a client has a p2p connection to the given peer id.
	isPeerConnected: (peerId) ->
		easyrtc.getConnectStatus(peerId) is easyrtc.IS_CONNECTED

	# Get device ids in room server
	getRoomOccupantsAsArray: (roomName) ->
		easyrtc.getRoomOccupantsAsArray roomName

	# Check peer connects in room
	isPeerInAnyRoom: (peerId) ->
		easyrtc.isPeerInAnyRoom peerId

	# Sets a callback function when the given message type is emitted by another client.
	setListener: (callback, msgType) ->
		easyrtc.setPeerListener callback, msgType

	# Sets a callback function in case a socket is disconnected by external (to the API) reasons.
	setDisconnectListener: (callback) ->
		easyrtc.setDisconnectListener callback

	# Sends a message of the given type to the given peer.
	sendMessage: (peer, msgType, msgData) ->
		easyrtc.sendPeerMessage peer, msgType, msgData,
			-> ,
			->

	# Returns a map of rooms the user can see.
	# Note: you must be already connected.
	# successCb will be called with a map of rooms as its argument.
	# errorCb will be called on failure with an errorCode and errorText as its arguments.
	getRoomList: (successCb, errorCb) ->
		easyrtc.getRoomList successCb, errorCb

	# Converts the given easyrtcid to a user name.
	idToUsername: (id) ->
		easyrtc.idToName id

	# Gets the first easyrtcid that is using the given user name.
	usernameToId: (username) ->
		id = easyrtc.usernameToIds(username)[0]
		if typeof id is 'undefined' or id is null then false else id.easyrtcid

	getSocket: ->
		easyrtc.webSocket

module.exports = Rtc