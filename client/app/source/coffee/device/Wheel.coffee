class Wheel
	rotation: 0
	rotationDest: 0
	deviceFactor: 1
	deviceFactorOffset: 1.5
	# deviceFactor: 0.0009
	deviceFactorAndroid: 0.08
	constructor:->
		@container = $("<div/>").addClass 'container'
		@imgCockpit = $('<img/>').addClass('cockpit').attr 'src', 'assets/img/cockpit.jpg'
		@imgWheel = $('<img/>').addClass('wheel').attr 'src', 'assets/img/wheel.png'
		@container.append @imgCockpit
		@container.append @imgWheel

		if window.DeviceMotionEvent != undefined
			window.addEventListener "deviceorientation", @onDeviceMotion

		@update()


	onDeviceMotion:(event)=>
		if event.rotationRate != null
			@rotationDest = (event.beta + @deviceFactorOffset) * @deviceFactor

	update:->
		# @rotation += (@rotationDest - @rotation ) * .9
		@rotation = @rotationDest

		@transformStr = "translate3d(-50%, 0, 0)"
		@transformStr += "rotateZ(#{@rotation}deg)"

		@imgCockpit.css 'transform', @transformStr

		$(window).trigger 'interact', [ @rotation ]

		window.requestAnimationFrame @update.bind @


module.exports = Wheel