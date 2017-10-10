function populationHandler (sb) {

	var request_url;
	function INIT () {
		sb.listen({
			listenFor: ["set-population"],
			moduleID: this.moduleID,
			moduleFunction: "set_population"
		})

		sb.listen({
			listenFor: ["receive-population-crowd"],
			moduleID: this.moduleID,
			moduleFunction: "set_population_crowd"
		})

		sb.listen({
			listenFor: ["setup-complete"],
			moduleID: this.moduleID,
			moduleFunction: "set_url"
		})
	}

	function SET_URL () {
		request_url = sb.settings.crowd_request_url+"?min_dist="+sb.settings.population_spread.min+"&max_dist="+sb.settings.population_spread.max;
	}

	function SET_POPULATION (d) {
		sb.population = new index.Population(d);

		sb.notify({
			type : "http-get",
			data: {
				url: request_url+'&crowd_size='+sb.population.get_size(),
				responseType: "receive-population-crowd",
			}
		});
	}

	function SET_POPULATION_CROWD (d) {
		var crowd = new index.Crowd(sb.population.get_size());
		crowd.set_points(d.data);

		if (debug.sentinel(crowd.is_set(), "Crowd failed to initialise correctly.")) {
			sb.population = null;
			return;
		}

		sb.population.set_crowd(crowd);

		if (sb.population.is_set) {
			sb.notify({
				type : "population-create-init",
				data: null,
			});
		}


	} 
	
	function DESTROY () {
		sb.unlisten(this.moduleID)
	}

	return {
        init : INIT,
        set_url: SET_URL,
        set_population: SET_POPULATION,
        set_population_crowd: SET_POPULATION_CROWD,
        destroy : DESTROY
    };
}