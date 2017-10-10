function svgHandler (sb) {

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
		var container = document.getElementById("svg-container");
		var w = sb.w;
		var h = sb.h;
		var timeout;

		var svg = d3.select(container).append("svg")
		.attr("width", w)
		.attr("height", h);

		var crowd_group = svg.append("g");
		var crowd_points;

		//add bounding circles
		var circles_group = svg.append("g");
		var circles;

		function CREATE () {

			if (crowd_points) {

				UPDATE()
				return;
			}

			var points = sb.population.get_points();

			crowd_points = crowd_group.selectAll(".crowd-point")
				.data(points)
				.enter()
				.append("circle")
				.attr("class", "crowd-point")
				.attr("cx", function (d) {
					return ((d.x + sb.crowds.offset.x) * sb.crowds.multiplier)+ sb.w/2;
				})
				.attr("cy", function (d) {
					return ((d.y + sb.crowds.offset.y) * sb.crowds.multiplier)+ sb.h/2;
				})
				.attr("r", (sb.settings.population_spread.min/5)*sb.crowds.multiplier);
			
				/*.attr("class", "crowd-point")
				.attr("cx", function (d) {
					return ((d.x + sb.crowds.offset.x) * sb.crowds.multiplier)+ sb.w/2;
				})
				.attr("cy", function (d) {
					return ((d.y + sb.crowds.offset.y) * sb.crowds.multiplier)+ sb.h/2;
				})
				.attr("r", (sb.settings.population_spread.min/5)*sb.crowds.multiplier);
				*/
		}

		function UPDATE () {
			var points = sb.population.get_points();

			crowd_points
				.data(points)
				.transition("cubic-in-out")
				.duration(1000)
				.attr("cx", function (d) {
					return ((d.x + sb.crowds.offset.x) * sb.crowds.multiplier)+ sb.w/2;
				})
				.attr("cy", function (d) {
					return ((d.y + sb.crowds.offset.y) * sb.crowds.multiplier)+ sb.h/2;
				});

			if (circles) {
				circles
					.data([])
					.exit()
					.remove()
			}

			if (sb.population.get_sorted_crowds()) {

				circles = circles_group.selectAll(".crowd-circle")
					.data(sb.population.get_sorted_crowds())
					.enter()
					.append("g")
					.attr("class", "crowd-circle")
					.attr("transform", function (d) {
						var x = ((d.get_offset().x + sb.crowds.offset.x) * sb.crowds.multiplier)+ sb.w/2;
						var y = ((d.get_offset().y + sb.crowds.offset.y) * sb.crowds.multiplier)+ sb.h/2;
						return "translate("+x+","+y+")"
					});

				timeout = setTimeout(function () {
				/*circles.append("circle")
					.attr("r", function (d) {
						var r = d.get_radius() * sb.crowds.multiplier;
						var min = (sb.settings.population_spread.min/5)*sb.crowds.multiplier*2
						return min < r ? r : min;
					})
					.attr("opacity", 0)*/

				circles.append("text")
					.text(function (d) {
						if (d.get_size() == 0) {
							return;
						}
						return d.get_label();
					})
					.attr("text-anchor", "middle")
					.attr("y", function (d) {
						var r = d.get_radius() * sb.crowds.multiplier;
						var min = (sb.settings.population_spread.min/5)*sb.crowds.multiplier*2
						return (-1*(min < r ? r : min)) - sb.font_size;
					})
				}, 1000)
			}
		}

		function RESET () {
			if (!crowd_points) {return;}
			if (timeout) {clearTimeout(timeout)}

			crowd_points
			.data([])
			.exit()
			.remove()

			crowd_points = null;

			if (circles) {
				circles
					.data([])
					.exit()
					.remove()
			}


		}

		function RESIZE () {
			w = sb.w;
			h = sb.h;

			svg
			.attr("width", w)
			.attr("height", h);

			if (crowd_points) {
				crowd_points
				.transition("cubic-in-out")
				.duration(sb.duration)
				.attr("cx", function (d) {
					return ((d.x + sb.crowds.offset.x) * sb.crowds.multiplier)+ sb.w/2;
				})
				.attr("cy", function (d) {
					return ((d.y + sb.crowds.offset.y) * sb.crowds.multiplier)+ sb.h/2;
				});
			}

			if (circles) {
				circles
				.transition("cubic-in-out")
				.duration(sb.duration)
				.attr("transform", function (d) {
					var x = ((d.get_offset().x + sb.crowds.offset.x) * sb.crowds.multiplier)+ sb.w/2;
					var y = ((d.get_offset().y + sb.crowds.offset.y) * sb.crowds.multiplier)+ sb.h/2;
					return "translate("+x+","+y+")"
				});

				circles.selectAll("text")
				.transition("cubic-in-out")
				.duration(sb.duration)
				.attr("y", function (d) {
					var r = d.get_radius() * sb.crowds.multiplier;
					var min = (sb.settings.population_spread.min/5)*sb.crowds.multiplier*2
					return (-1*(min < r ? r : min)) - sb.font_size;
				})
			}
		}

		this.create = CREATE;
		this.reset = RESET;
		this.update = UPDATE;
		this.resize = RESIZE;
	}
	
	function DESTROY () {
		sb.unlisten(this.moduleID)
		init_sphere_array = null;
	}

	return {
        init : INIT,
        setup: SETUP,
        destroy : DESTROY
    };
}