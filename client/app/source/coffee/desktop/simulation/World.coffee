class World

	targetPosition: new THREE.Vector3( 0, 0, 0 );
	position: new THREE.Vector3( 0, 0, 0 );
	constructor: (@container) ->
		
		@buildScene()
		@buildRoad()

		@render()

	buildScene:->
		@scene = new THREE.Scene()
		@camera = new THREE.PerspectiveCamera 75, $(window).width() / $(window).height(), 0.1, 1000
		@camera.position.y = 1
		@camera.position.z = 5

		@renderer = new THREE.WebGLRenderer()
		@renderer.setSize $(window).width(), $(window).height()

		@container.append @renderer.domElement

	buildRoad:->
		geom = new THREE.BoxGeometry 1, 1, 1
		material = new THREE.MeshBasicMaterial color:0xffff00
		@cube = new THREE.Mesh geom, material
		@scene.add @cube

	updateCar:(rotation)->
		# console.log rotation
		@targetPosition.x = rotation * -0.1

	render:->
		window.requestAnimationFrame @render.bind @

		@cube.rotation.y+=0.01

		@position.x += (@targetPosition.x - @position.x) * 0.5

		@camera.lookAt @position

		@renderer.render @scene, @camera

module.exports = World