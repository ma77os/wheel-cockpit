Wheel = require './device/Wheel'
Pairing = require './device/Pairing'
MobileClient = require './client/MobileClient.coffee'

class Device
	@init:->
		console.log("Device init")
		$(window).on 'room-name-setted', @onRoomNameSetted
		$(window).on 'interact', @onInteractDetected
		@build()

	@build:->
		@setUp()
		@container = $("<div/>").attr("id", "device-wrap")

		@pairing = new Pairing()
		@container.append @pairing.container

		$("body").append @container


	@initClient: (roomName) =>
		@currentRoomName = roomName

		if @client is null
			@setUp()

		@client.connect(@currentRoomName)

	@setUp: =>
		@client = new MobileClient { defaultRoomName: '', @currentRoomName }

		@client.subscribe @client.messages.SERVER_CONNECTION_SUCCESS, =>
			console.log "SERVER_CONNECTION_SUCCESS"
			@client.joinRoom @currentRoomName, null

		@client.subscribe @client.messages.START_ALL, =>
			console.log "START ALL"
		
		@client.subscribe @client.messages.ROOM_JOIN_SUCCESS, (messageType, roomName) =>
			@currentRoom = roomName
			@client.sendMessage @client.messages.PEER_CONNECTION_SUCCESS
			@initApp()
			# EventBroadcaster.trigger "joinRoom", @currentRoom

		@client.subscribe @client.messages.PEER_CONNECTION_LOST, =>
			console.log "PEER_CONNECTION_LOST"
			@client.disconnect()

		# @client.connect()

	@onInteractDetected: (event, data)=>
		@client.sendMessage @client.messages.INTERACTION, data

	@onRoomNameSetted: (event, roomName)=>
		@initClient roomName

	@initApp:=>
		@container.empty()
		@wheel = new Wheel()
		@container.append(@wheel.container)



Device.init()