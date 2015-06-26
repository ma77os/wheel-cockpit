class Wheel
	rotation: 0
	rotationDest: 0
	deviceFactor: 1
	# deviceFactor: 0.0009
	deviceFactorAndroid: 0.08
	constructor:->
		@container = $("<div/>").addClass 'wheel'

		if window.DeviceMotionEvent != undefined
			window.addEventListener "deviceorientation", @onDeviceMotion

		@update()


	onDeviceMotion:(event)=>
		if event.rotationRate != null
			@rotationDest = event.beta * @deviceFactor

	update:->

		@rotation += (@rotationDest - @rotation) * 0.5

		@transformStr = "translate3d(-50%, -50%, 0)"
		@transformStr += "rotateZ(#{@rotation}deg)"

		@container.css 'transform', @transformStr


		window.requestAnimationFrame @update.bind @


module.exports = Wheel