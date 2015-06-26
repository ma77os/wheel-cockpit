QueryString = require './utils/QueryString.coffee'
ScriptLoader = require './utils/ScriptLoader.coffee'
DeviceDetector = require './utils/DeviceDetector.coffee'

class Main

	@createClient: () ->
		deviceDetector = new DeviceDetector(window.navigator.userAgent)

		window.isMobile = deviceDetector.isMobile()
		window.isTablet = deviceDetector.isTablet()
		window.isDevice = window.isMobile or window.isTablet

		window.experienceCompatible = (!!Modernizr.peerconnection or !!Modernizr.websockets) and !!Modernizr.audio and !!Modernizr.canvas

		url = if window.isDevice then "assets/js/device.js" else "assets/js/desktop.js"
		ScriptLoader.load url


Main.createClient()