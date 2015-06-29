# An ID object containing the given characters with the specified length.

class Id

	constructor: (chars, length) ->
		chars = chars or ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','Y','Z']
		length = length or 4
		value = new Array(length)
		charsLength = chars.length
		value[i] = chars[Math.floor(Math.random() * charsLength)] for i in [0...length]
		@value = value.join ''

	# Client classes should call this method to get the raw value.
	valueOf: -> @value


module.exports = Id