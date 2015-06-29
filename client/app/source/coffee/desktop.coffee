DesktopClient = require './client/DesktopClient.coffee'
Pairing = require './desktop/Pairing'
CarView = require './desktop/CarView'

class Desktop
	@init:->
		console.log("desktop init")
		@build()
		

	@build:->
		@container = $("<div/>").attr("id", "desktop-wrap")
		
		@pairing = new Pairing()
		@container.append @pairing.container

		$("body").append @container

		@initClient()

	@initClient: =>
		@client = new DesktopClient {}

		@client.subscribe @client.messages.SERVER_CONNECTION_SUCCESS, =>
			console.log "SERVER_CONNECTION_SUCCESS"

		@client.subscribe @client.messages.SERVER_DISCONNECT, =>
			console.log "SERVER_DISCONNECT"

		@client.subscribe @client.messages.PEER_CONNECTION_LOST, =>
			console.log "PEER_CONNECTION_LOST"
			@client.disconnect()

		@client.subscribe @client.messages.PEER_CONNECTION_SUCCESS, =>
			console.log "PEER_CONNECTION_SUCCESS"
			@goApplication()

		@client.subscribe @client.messages.START_ALL, =>
			console.log "START ALL"
		
		@client.subscribe @client.messages.ROOM_JOIN_SUCCESS, (messageType, roomName) =>
			@currentRoom = roomName
			$(window).trigger "print-code", [ @currentRoom ]

		@client.subscribe @client.messages.INTERACTION, (messageType, data) =>
			$(window).trigger "update-move", [data]

		@client.connect()

	@goApplication:=>
		@container.empty()
		@pairing = new CarView()
		@container.append @pairing.container


Desktop.init()