function threeHandler (sb) {

	function INIT () {
		sb.listen({
			listenFor: ["checks-complete"],
			moduleID: this.moduleID,
			moduleFunction: "setup"
		})

		sb.listen({
			listenFor: ["population-create-complete"],
			moduleID: this.moduleID,
			moduleFunction: "create"
		})

		sb.listen({
			listenFor: ["population-unsort-complete"],
			moduleID: this.moduleID,
			moduleFunction: "update"
		})

		sb.listen({
			listenFor: ["population-sort-complete"],
			moduleID: this.moduleID,
			moduleFunction: "update"
		})

		sb.listen({
			listenFor: ["set-population"],
			moduleID: this.moduleID,
			moduleFunction: "reset"
		})

		sb.listen({
			listenFor: ["resize-trigger"],
			moduleID: this.moduleID,
			moduleFunction: "resize",
		})
	}

	function SETUP () {

		var timeout;
		var current_transitions = []
		var person_height = 1.7

		//setup three scene
		console.warn = function () {};
		var container = document.getElementById("canvas-container");
		var three_scene = new index.Three_scene(container)
		three_scene.set_camera("OrthographicCamera", 30);

		//three_scene.add(new THREE.AxisHelper(20));
		load_sprite_maps(three_scene);
		
		three_scene.set_group("crowd_group", new THREE.Object3D());
		
		var controls = new THREE.OrbitControls(three_scene.get_camera(), three_scene.get_renderer().domElement);
			controls.maxPolarAngle = Math.PI/2; 
			controls.minZoom = 0.25//person_height*1000;
			controls.maxZoom = 50//person_height*1000000;


		


		//setup canvas scene
		var base = d3.select(container);
		var chart = base.append("canvas")
			.attr("id", "labels-canvas")
			.attr("class", "active")
  			.attr("width", sb.w)
  			.attr("height", sb.h);

		var canvas_scene = chart.node().getContext("2d");
		canvas_scene.font = "12px Helvetica";
		canvas_scene.fillStyle = "#000000";
		canvas_scene.textAlign = "center"

		render();

		function CREATE () {

			var points = sb.population.get_points();
			//var material = three_scene.get_material("sprite-4");

			points.forEach(function (p) {
				var sprite = new THREE.Sprite(three_scene.get_material("sprite-"+(4+Math.round(Math.random()))));
				sprite.scale.x = person_height;
				sprite.scale.y = person_height;
				sprite.position.x = p.x;
				sprite.position.z = p.y;
				three_scene.add(sprite, "crowd_group")
			})

		}

		function UPDATE () {

			//interrupt any ongoing transitions
			if (timeout) {clearTimeout(timeout)};
			if (current_transitions.length > 0) {
				current_transitions.forEach(function (transition) {
					transition.end()
				})
				current_transitions = [];
			}

			//setup and start transitions to move all people from their current positions to new ones
			var points = sb.population.get_points();
			var group = three_scene.get_group("crowd_group");
			
			var i;
			var l = points.length;

			for (i=0; i<l; i++) {
				var transition = new index.Transition(group.children[i])
				transition.set_duration(sb.duration);
				transition.set_end_position(points[i].x, 0, points[i].y);
				transition.start();
				current_transitions.push(transition)
			}
			
			//hide labels for the duration of the crowd transitions
			if (sb.population.get_sorted_crowds().length > 0) {
				utility.removeClass(chart.node(), "active");

				setTimeout(function () {
					utility.addClass(chart.node(), "active")
				}, sb.duration)
			}
		}

		function RESET () {
			clear_group(three_scene.get_group("crowd_group"));

			canvas_scene.clearRect(0,0,sb.w,sb.h);
		}

		function RESIZE () {

			three_scene.update_size();

			chart
  			.attr("width", sb.w)
  			.attr("height", sb.h);
			
		}

		this.create = CREATE;
		this.reset = RESET;
		this.update = UPDATE;
		this.resize = RESIZE;

		function render () {

			update_labels()

			three_scene.render()
			requestAnimationFrame(render);
		};

		function update_labels () {
			canvas_scene.clearRect(0,0,sb.w,sb.h);
			var crowds = sb.population ? sb.population.get_sorted_crowds() : 0;
			var i;
			var l = crowds.length;
			if (l > 0) {

					for (i=0; i<l; i++) {
						if (crowds[i]) {
						var label_position_3d = new THREE.Vector3(crowds[i].get_offset().x, (person_height/2)+0.5, crowds[i].get_offset().y);
						var label_position_2d = world_to_screen(label_position_3d, three_scene.get_camera());
						canvas_scene.fillText(crowds[i].get_label(),label_position_2d.x,label_position_2d.y);
						}
					}
			}
		}
	}

	function create_environment () {
		var folder = "assets/skybox-1/";
		var extension = "png";
		var urls = [
		  folder+"/pos-z."+extension,
		  folder+"/pos-z."+extension,
		  folder+"/pos-y."+extension,
		  folder+"/neg-y."+extension,
		  folder+"/pos-z."+extension,
		  folder+"/pos-z."+extension,
		]

		var loader = new THREE.CubeTextureLoader();
		loader.setCrossOrigin( 'anonymous' );
		var cubemap = loader.load(urls);
		cubemap.format = THREE.RGBFormat;
		console.log(cubemap)
		//return cubemap;

		 var textureCube = THREE.ImageUtils.loadTextureCube( urls , undefined);
		 console.log(textureCube)

        var shader = THREE.ShaderLib["cube"];
        var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
        shader.uniforms['tCube'].value = cubemap;
        
        var material = new THREE.ShaderMaterial({
            fragmentShader    : shader.fragmentShader,
            vertexShader  : shader.vertexShader,
            uniforms  : shader.uniforms,
            depthWrite : false,
            side: THREE.BackSide,
        });

        return material;
	}

	function world_to_screen (vector_3d, camera) {
		vector_3d.project(camera)

		return {
			x: (vector_3d.x * sb.w/2 ) + (sb.w/2),
    		y: - (vector_3d.y * sb.h/2 ) + sb.h/2
		}
	}

	function clear_group (group) {
		while (group.children.length > 0) {
     		group.remove(group.children[0]);
		}
	}

	function load_font (scene, font_name) {
		scene.set_material("text", new THREE.MeshBasicMaterial({color: 0x000000}));
		var loader = new THREE.FontLoader();
		loader.load( 'assets/typefaces/'+font_name+'.typeface.json', function (font) {
			scene.set_font(font_name, font);
		} );
	}

	function load_sprite_maps (scene) {
		var i;
		var l = 5;

		for (i=4; i<=l; i++) {
			var sprite_map = new THREE.TextureLoader().load( "assets/sprites/person-"+i+".png" );
			scene.set_material("sprite-"+i, new THREE.SpriteMaterial( { map: sprite_map, color: 0xffffff } ));
		}
	}
	
	function DESTROY () {
		sb.unlisten(this.moduleID)
	}

	return {
        init : INIT,
        setup: SETUP,
        destroy : DESTROY
    };
}