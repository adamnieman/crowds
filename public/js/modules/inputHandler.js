function inputHandler (sb) {

	var input_population_size = document.getElementById("population_size");
	var input_population_size_submit = document.getElementById("population_size_submit");
	//var select_context = document.getElementById("select-context");
	var select_context_rb = document.getElementsByClassName("select-context-rb");
	var svg_container = document.getElementById("svg-container");
	var canvas_container = document.getElementById("canvas-container");


	function INIT () {
		sb.listen({
			listenFor: ["prompt-population"],
			moduleID: this.moduleID,
			moduleFunction: "prompt_population_size"
		})

		sb.addEvent(input_population_size_submit, "click", get_population_size)

		var i;
		var l = select_context_rb.length

		for (i=0; i<l; i++) {
			sb.addEvent(select_context_rb[i], "click", set_context);
		}

		//sb.addEvent(select_context, "change", set_context);
	}

	function PROMPT_POPULATION_SIZE () {
		var population_size = prompt("Input the size of the crowd you want to visualise");

		if (!utility.checkWithinRange(population_size, sb.settings.population_size.min, sb.settings.population_size.max)) {
			return;
		}

		input_population_size.value = +population_size;

		sb.notify({
			type : "set-population",
			data: +population_size,
		});
	}

	function get_population_size () {
		var population_size = input_population_size.value;
		
		if (!utility.checkWithinRange(population_size, sb.settings.population_size.min, sb.settings.population_size.max)) {
			return;
		}

		sb.notify({
			type : "set-population",
			data: +population_size,
		});
	}

	function set_context () {
		var value = this.value;

		switch (value) {
			case "2d":
				utility.removeClass(canvas_container, "active");
				utility.addClass(svg_container, "active");
				break;
			case "3d":
				utility.removeClass(svg_container, "active");
				utility.addClass(canvas_container, "active");
				break;
			default:
				debug.sentinel(false, "Context selector input providing invalid content: '"+value+"'");
		}
	}

	function DESTROY () {
		sb.unlisten(this.moduleID)
	}

	return {
        init : INIT,
        prompt_population_size: PROMPT_POPULATION_SIZE,
        destroy : DESTROY
    };
}