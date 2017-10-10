function queryHandler (sb) {

	function INIT () {
		sb.listen({
			listenFor: ["setup-complete"],
			moduleID: this.moduleID,
			moduleFunction: "getInput"
		})
	}

	function GETINPUT () {

		var population_size = utility.getQueryStringValue("population");

		if (!population_size) {
			sb.notify({
				type : "prompt-population",
				data: null,
			});
		}

		if (!utility.checkWithinRange(population_size, sb.settings.population_size.min, sb.settings.population_size.max)) {
			return;
		}

		var input_population_size = document.getElementById("population_size");
		input_population_size.value = +population_size;

		sb.notify({
			type : "queries-complete",
			data: null,
		});

		sb.notify({
			type : "set-population",
			data: +population_size,
		});
	}
	
	function DESTROY () {
		sb.unlisten(this.moduleID)
	}

	return {
        init : INIT,
        getInput: GETINPUT,
        destroy : DESTROY
    };
}