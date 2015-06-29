class QueryString
	@hasParameter:(name)->
		location.search.indexOf(name) > -1

	@getParameterValue:(name)->
		name = name.replace( /[\[]/, "\\[" ).replace( /[\]]/, "\\]" )
		regex = new RegExp( "[\\?&]#{name}=([^&#]*)" )
		results = regex.exec( location.search )
		if results? then decodeURIComponent( results[ 1 ].replace( /\+/g, " " ) ) else "" 


module.exports = QueryString