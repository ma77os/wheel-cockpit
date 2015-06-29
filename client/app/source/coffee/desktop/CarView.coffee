class CarView

	constructor:->
		$(window).on "update-move", @updateMove
		@build()
	
	build:->
		@container = $("<div/>").addClass 'container'
		@boxInfo = $("<div/>").addClass 'box-info'
		@descPage = $('<span/>').addClass 'desc-text'
		@boxInfo.append @descPage
		@container.append @boxInfo

	updateMove:(event, val)=>
		$('.desc-text').html "Rotation value: <br> #{val}"

module.exports = CarView
