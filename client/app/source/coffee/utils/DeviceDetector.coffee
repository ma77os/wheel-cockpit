class DeviceDetector

	constructor: (userAgent) ->
		@mobileDetect = new MobileDetect userAgent

	mobile: -> 
		@mobileDetect.mobile()

	isMobile: -> 
		@mobileDetect.is @mobileDetect.os()

	isAndroid: -> 
		@mobileDetect.os() == "AndroidOS"

	isIOS: ->
		@mobileDetect.os() == "iOS"

	isTablet: ->
		@mobileDetect.tablet()?



module.exports = DeviceDetector