var index = {

}

index.Transition = function (_obj) {
	var obj;
	var positions = {
		start: {x: null, y: null, z: null},
		end: {x: 0, y: 0, z: 0}
	};

	var duration = 1000; //ms
	var fps = 25; //
	var interval;

	function construct (_obj) {
		if (debug.sentinel(_obj.hasOwnProperty("position") && _obj.position instanceof THREE.Vector3, "Failed to initialise transition on invalid object.")) {
			return;
		}

		obj = _obj;

		positions.start.x = obj.position.x;
		positions.start.y = obj.position.y;
		positions.start.z = obj.position.z;
	}



	this.end = function () {
		if (interval) {clearInterval(interval)}
	}
	
	this.start = function () {
		var time_count = 0

		interval = setInterval (function () {
			obj.position.x = Math.easeInOutCubic(time_count, positions.start.x, positions.end.x-positions.start.x, duration)
			obj.position.y = Math.easeInOutCubic(time_count, positions.start.y, positions.end.y-positions.start.y, duration)
			obj.position.z = Math.easeInOutCubic(time_count, positions.start.z, positions.end.z-positions.start.z, duration)
			


			time_count += fps;
			if (time_count >= duration) {
				clearInterval(interval);
			}
		}, 1000/fps)
	}

	this.set_end_position = function (_x, _y, _z) {
		if (debug.sentinel(typeof(_x) == "number", "Failed to set end position of transition due to invalid x value "+_x+".") ||
			debug.sentinel(typeof(_y) == "number", "Failed to set end position of transition due to invalid y value "+_y+".") ||
			debug.sentinel(typeof(_z) == "number", "Failed to set end position of transition due to invalid z value "+_z+".")) {
			return;
		}

		positions.end.x = _x;
		positions.end.y = _y;
		positions.end.z = _z;
	}

	this.set_duration = function (_duration) {
		if (debug.sentinel(utility.check_positive_number(_duration), "Failed to set duration of transition due to invalid duration value "+_duration+".")) {
			return;
		}

		duration = _duration;
	}

	construct (_obj);
}

index.Three_scene = function (_parent) {

	var set = false;
	var parent;

	var scene;
	var camera;
	var renderer;
	var lights = {}
	var groups = {}
	var materials = {}
	var fonts = {}
	var w = 100;

	function construct (_parent) {
		if (debug.sentinel(utility.is_element(_parent), "Failed to initialise scene as parent is not a valid DOM object.")) {
			return;
		}
		parent = _parent;

		set_scene();
		set_renderer();

		parent.appendChild(renderer.domElement);
	}

	function set_scene () {
		scene = new THREE.Scene();
	}

	function set_renderer () {
		renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, antialias: true });
		renderer.setClearColor(new THREE.Color(0xffffff));
		renderer.setSize(parent.offsetWidth, parent.offsetHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		check_if_set();
	}

	function set_light (_type) {
		if (debug.sentinel(typeof(THREE[_type]) == "function", "Failed to initialise light of nonexistant type "+_type+".")) {
			return;
		}

		var light = lights[_type]
		light = new THREE[_type](0xffffff);
		light.position.set(100, 100, 0);
		scene.add(light);
	}

	function check_if_set () {
		if (camera && renderer && scene) {
			set = true;
		}
	}

	this.set_camera = function (_type, _w) {

		if (debug.sentinel(typeof(THREE[_type]) == "function", "Failed to initialise camera of nonexistant type "+_type+".")) {
			return;
		}

		var aspect_ratio = parent.offsetWidth / parent.offsetHeight;

		switch (_type) {
			case "OrthographicCamera":
				if (_w && utility.check_positive_number(_w)) {
					w = _w;
				}
				camera = new THREE[_type](w/2, -w/2, w/(2*aspect_ratio), -w/(2*aspect_ratio), 1, 1000);
				break;
			default:
				camera = new THREE[_type](30, aspect_ratio, 0.1, 10000000);
		}

		camera.position.x = 50;
		camera.position.y = 10;
		camera.position.z = 50;
		camera.lookAt(new THREE.Vector3(0, 0, 0))
		scene.add(camera);

		check_if_set();
	}

	this.update_size = function () {
		if (!camera) {return}

		var type = camera.type;
		var aspect_ratio = parent.offsetWidth / parent.offsetHeight;

		renderer.setSize(parent.offsetWidth, parent.offsetHeight);

		switch (type) {
			case "OrthographicCamera":
				camera.top = w/(2*aspect_ratio);
				camera.bottom = -w/(2*aspect_ratio);
				break;
			default:
				camera.aspect = aspect_ratio;
		}
	}

	this.get_camera = function () {return camera};
	this.get_renderer = function () {return renderer};

	this.add = function (_obj, _add_to) {
		if (debug.sentinel(_obj instanceof THREE.Object3D, "Could not add object as it is not a valid instance of Object3D.")) {
			return;
		}

		if (!_add_to ||
			debug.sentinel(groups[_add_to], "Could not add object to nonexistant group "+_add_to+". Adding to scene instead")) {
			scene.add(_obj);
			return;
		}

		groups[_add_to].add(_obj);
		return;
	}
	this.get_material = function (_name) {
		if (debug.sentinel(materials[_name], "Failed to get material. No existing material by the name of "+_name+".")) {
			return;
		}

		return materials[_name];
	}

	this.set_material = function (_name, _material) {
		if (debug.sentinel(_material instanceof THREE.Material, "Failed to assign an invalid material to name "+_name+".")) {
			return;
		}

		debug.sentinel(!materials[_name], "Overwriting existing material by the name of "+_name+".")

		materials[_name] = _material;
	}

	this.set_group = function (_name, _group, _parent) {
		if (debug.sentinel(_group instanceof THREE.Object3D, "Failed to assign an invalid group to name "+_name+".")) {
			return;
		}

		if (debug.sentinel(groups[_parent], "Failed to add group to invalid parent "+_parent+". Adding to scene instead.")) {
			scene.add(_group);
		}
		else {
			groups[_parent].add(group);
		}

		debug.sentinel(!groups[_name], "Overwriting existing group by the name of "+_name+".");

		groups[_name] = _group;

	}

	this.get_group = function (_name) {
		if (debug.sentinel(groups[_name], "Failed to get group. No existing group by the name of "+_name+".")) {
			return;
		}

		return groups[_name];
	}

	this.set_font = function (_name, _font) {
		if (debug.sentinel(_font instanceof THREE.Font, "Failed to assign an invalid font to name "+_name+".")) {
			return;
		}

		debug.sentinel(!fonts[_name], "Overwriting existing font by the name of "+_name+".")

		fonts[_name] = _font;
	}

	this.get_font = function (_name) {
		if (debug.sentinel(fonts[_name], "Failed to get font. No existing font by the name of "+_name+".")) {
			return;
		}

		return fonts[_name];
	}

	this.render = function () {
		renderer.render(scene, camera);
	}

	construct(_parent)
}

index.Population = function (_size) {

	var size;
	var set = false;

	var sort_by;
	var not_sorted;
	var sort_categories = {

	}

	var construct = function (_size) {
		if (debug.sentinel(typeof(_size)=="number", "Population size of invalid type '"+typeof(_size)+"' passed to Population constructor.") ||
			debug.sentinel(_size >= 0, "Population size of invalid value '"+_size+"' passed to Population constructor. Population size must be a positive value.")) {
			return;
		}
		size = _size;
	}

	var extract_points = function (_crowd) {
		if (debug.sentinel(_crowd instanceof index.Crowd && _crowd.is_set(), "Invalid or unset Crowd object passed to Population set_crowd function")) {
			return;
		}

		var points_array = [];
		var points = _crowd.get_points();
		var offset = _crowd.get_offset();

		var i;
		var l = points.length;

		for (i=0; i<l; i++) {
			points_array.push({
				x: points[i].x + offset.x,
				y: points[i].y + offset.y,
			})
		}

		return points_array;
	}

	this.unsort = function () {
		sort_by = null;
		sort_categories = {};
	}

	this.set_sort_by = function (_sort_by, _sort_categories) {
		
		if (debug.sentinel(typeof(_sort_by)=="string", "Sort name of invalid type '"+typeof(_size)+"' passed to Population constructor.") ||
			debug.sentinel(_sort_categories.constructor === Array, "Sort categories of invalid type '"+_size+"' passed to Population constructor. Sort categories must be in the form of an array.")) {
			return;
		}

		sort_by = _sort_by;
		sort_categories = {};

		var i;
		var l = _sort_categories.length;
		for (i=0; i<l; i++) {
			sort_categories[_sort_categories[i]] = null;
		}
	}

	this.set_sorted_crowd = function (_category, _crowd) {
		if (debug.sentinel(sort_by, "Cannot set a sorted crowd when population is currently unsorted.") ||
			debug.sentinel(sort_categories.hasOwnProperty(_category), "Cannot set crowd for invalid category '"+_category+"' when sorting by '"+sort_by+"'. Valid categories are '"+Object.keys(sort_categories).join(", ")+"'.") ||
			debug.sentinel(_crowd instanceof index.Crowd && _crowd.is_set(), "Invalid or unset Crowd object passed to Population set_sorted_crowd function.")) {
			return;
		}

		_crowd.set_label(_category);

		sort_categories[_category] = _crowd;
	}

	this.set_crowd = function (_crowd) {
		if (debug.sentinel(_crowd instanceof index.Crowd && _crowd.is_set(), "Invalid or unset Crowd object passed to Population set_crowd function.")) {
			return;
		}

		not_sorted = _crowd;
		set = true;
	}

	this.get_points = function () {
		if (!set) {return};

		var points_array = [];

		if (!sort_by) {
			points_array = extract_points(not_sorted);
			return points_array;
		}

		for (var propt in sort_categories) {
			points_array = points_array.concat(extract_points(sort_categories[propt]));
		}

		return points_array;

	}
	this.get_sorted_crowds = function () {
		var sorted_crowds = []
		for (var propt in sort_categories) {
			sorted_crowds.push(sort_categories[propt]);
		}

		return sorted_crowds;
	}
	this.get_sort_by = function () {return sort_by};
	this.get_unsorted_crowd = function () {return not_sorted};
	this.get_size = function () {return size};
	this.is_set = function () {return set};

	construct(_size);
} 

index.Crowd = function (_size) {

	var points;
	var size;
	var offset = {x: 0, y: 0};
	var radius;

	var label;

	var set = false;
	

	var construct = function (_size) {
		if (debug.sentinel(typeof(_size)=="number", "Crowd size of invalid type '"+typeof(_size)+"' passed to Crowd constructor.") ||
			debug.sentinel(_size >= 0, "Crowd size of invalid value '"+_size+"' passed to Crowd constructor. Crowd size must be a positive value.")) {
			return;
		}
		size = _size;
	}

	var set_radius = function () {
		var w = utility.arrayMax(points, "x")-utility.arrayMin(points, "x");
		var h = utility.arrayMax(points, "y")-utility.arrayMin(points, "y");
	
		radius = utility.avg([w, h])/2;
	}

	this.set_label = function (_label) {
		label = _label;
	}

	this.set_points = function(_points) {
		if (debug.sentinel(_points.constructor === Array, "Crowd point array has invalid constructor '"+_points.constructor+"' passed to Crowd set_points function.") ||
			debug.sentinel(_points.length == size, "Crowd point array length not equal to size of crowd.")) {
			return;
		}

		points = _points;
		set_radius()
		set = true;
	}

	this.set_offset = function (_x, _y) {
		if (debug.sentinel(typeof(_x) == "number", "X offset of invalid type '"+typeof(_x)+"' passed to Crowd set_offset function.") ||
			debug.sentinel(typeof(_y) == "number", "Y offset of invalid type '"+typeof(_y)+"' passed to Crowd set_offset function.")) {
			return;
		}

		offset.x = _x;
		offset.y = _y;
	}

	this.get_size = function () {return size;}
	this.get_label = function () {return label;}
	this.get_points = function () {return points;}
	this.get_offset = function () {return offset;}
	this.get_radius = function () {return radius;}
	this.is_set = function () {return set;}

	construct(_size);
}

Math.easeInOutCubic = function (t, b, c, d) {
		//t = start time, b = start value, c = change in value, d = duration 
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	};

