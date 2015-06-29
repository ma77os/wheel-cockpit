class Pairing

	constructor:->
		$(window).on "print-code", @printCode
		@build()
	
	build:->
		@container = $("<div/>").addClass 'container'
		@boxInfo = $("<div/>").addClass 'box-info'
		@descPage = $('<span/>').addClass 'desc-text'
		@boxInfo.append @descPage
		@container.append @boxInfo

	printCode:(event, code)=>
		$('.desc-text').html "Digite o código abaixo: <br> #{code}"

module.exports = Pairing