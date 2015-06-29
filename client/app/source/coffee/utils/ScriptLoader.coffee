class ScriptLoader

	@load: (src, callback) ->
		script = document.createElement 'script'
		script.src = src
		done = no
		script.onload = ->
			if not done and (not @.readyState or @.readyState is 'complete')
				done = yes
				callback?()
		t = document.getElementsByTagName('script')[0]
		t.parentNode.insertBefore script, t


module.exports = ScriptLoader