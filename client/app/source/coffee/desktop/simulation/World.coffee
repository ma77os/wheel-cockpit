class World

	speed: -0.01
	accel:0
	vx:0
	vz:0
	angleDest:0
	angle:0
	FRICTION:0.9

	constructor: (@container) ->
		
		@buildScene()
		@buildRoad()

		$(window).on 'resize', @resize
		@resize()
		@render()

	buildScene:->
		@scene = new THREE.Scene()
		@camera = new THREE.PerspectiveCamera 75, $(window).width() / $(window).height(), 0.1, 1000
		@camera.position.y = 1
		@camera.position.z = 5

		@renderer = new THREE.WebGLRenderer()

		@container.append @renderer.domElement

	buildRoad:->
		geom = new THREE.PlaneGeometry 500, 500, 250, 250
		material = new THREE.MeshBasicMaterial color:0xffffff, side: THREE.DoubleSide, wireframe:true
		@floor = new THREE.Mesh geom, material
		@floor.rotation.x = Math.PI/2
		@scene.add @floor

	updateCar:(data)->
		# console.log rotation
		@angleDest = data.rotation * 0.1
		@accel = data.accel * 0.001


	render:->
		window.requestAnimationFrame @render.bind @

		@angle += (@angleDest - @angle) * 0.01

		@speed += @accel
		@speed *= @FRICTION

		@vx = Math.sin(@angle) * @speed
		@vz = Math.cos(@angle) * @speed

		@camera.position.x += @vx
		@camera.position.z += @vz
		@camera.rotation.y = @angle
		

		@renderer.render @scene, @camera


	resize:=>
		@renderer.setSize $(window).width(), $(window).height()


module.exports = World