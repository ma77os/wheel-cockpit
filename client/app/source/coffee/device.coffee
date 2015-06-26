Wheel = require './device/Wheel'
class Device
	@init:->
		console.log("Device init")
		@build()

	@build:->
		@container = $("<div/>").attr("id", "device-wrap")
		@wheel = new Wheel()
		@container.append(@wheel.container)

		$("body").append @container

Device.init()