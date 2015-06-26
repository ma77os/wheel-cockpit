class Wheel
	rotation: 0;
	constructor:->
		@container = $("<div/>").addClass 'wheel'

		@update()

	update:->
		@rotation+=1

		@transformStr = "translate3d(-50%, -50%, 0)"
		@transformStr += "rotateZ(#{@rotation}deg)"

		@container.css 'transform', @transformStr


		window.requestAnimationFrame @update.bind @


module.exports = Wheel