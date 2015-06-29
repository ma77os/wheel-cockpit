class Pairing

	constructor:->
		@build()

		setTimeout =>
			@setListeners()
		, 1000

	build:->
		@container = $("<div/>").addClass 'container'
		@boxInfo = $("<div/>").addClass 'box-info'
		@descPage = $('<span/>').addClass('desc-text').text "Insira o código de pareamento:"
		@inputPage = $('<input/>').addClass('input-code').attr("maxlength", 3)
		@submitBt = $('<div/>').addClass('submit-bt').text "ENVIAR"
		@boxInfo.append @descPage
		@boxInfo.append @inputPage
		@boxInfo.append @submitBt
		@container.append @boxInfo

	setListeners:=>
		$(".submit-bt").bind "click", @setRoomName

	setRoomName:=>
		roomName = $(".input-code").val()
		$(window).trigger 'room-name-setted', [ roomName.toUpperCase() ]


module.exports = Pairing