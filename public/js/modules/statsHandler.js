function statsHandler (sb) {

	var stats_population = document.getElementById("output-stats-population")
	var stats_breakdown = document.getElementById("output-stats-breakdown")
	var stats_notes = document.getElementById("output-stats-notes")
	var stats_source = document.getElementById("output-stats-source")

	function INIT () {

		sb.listen({
			listenFor: ["population-create-complete"],
			moduleID: this.moduleID,
			moduleFunction: "set_population"
		})

		sb.listen({
			listenFor: ["population-sort-complete"],
			moduleID: this.moduleID,
			moduleFunction: "set_breakdown"
		})
	}

	function SET_POPULATION () {
		stats_population.innerHTML = make_html("h2", "population size: "+make_html("em", sb.population.get_size()))
		stats_breakdown.innerHTML = "";
		stats_notes.innerHTML = "";
		stats_source.innerHTML = "";

	}

	function SET_BREAKDOWN () {
		stats_breakdown.innerHTML = "";

		var html = [];

		var sort_by = sb.population.get_sort_by();
		var filtered_settings = sb.settings.population_sort[sort_by];

		html.push(make_html("h2", "sorted by: "+make_html("em", sort_by)));

		var actual_crowds = sb.population.get_sorted_crowds();
		var ideal_crowds = sb.settings.population_sort[sort_by].categories;

		actual_crowds.forEach(function (crowd) {
			if (crowd.get_label() != "minor groups") {
				var output = make_html("p", crowd.get_label()+": "+make_html("em", utility.round(ideal_crowds[crowd.get_label()], 2)+"% ("+crowd.get_size()+")"))
				html.push(output);
			}
			else {
				var output = make_html("p", crowd.get_label()+": "+make_html("em", utility.round(sb.minor_groups.percent, 2)+"% ("+crowd.get_size()+")"))
				html.push(output);
				html.push("<ul>")
				sb.minor_groups.categories.forEach(function (minor_group) {
					var output = make_html("li", minor_group+": "+make_html("em", utility.round(ideal_crowds[minor_group], 2)+"%"))
					html.push(output);
				})
				html.push("</ul>")
			}
		})

		html.forEach(function (line) {
			stats_breakdown.innerHTML += line;
		})
		if (filtered_settings.hasOwnProperty("description") && filtered_settings["description"]) {
			stats_notes.innerHTML = make_html("h5", sb.settings.population_sort[sort_by].description)
		}
		else {
			stats_notes.innerHTML = "";
		}
		
		if (filtered_settings.hasOwnProperty("source") && filtered_settings["source"]) {
			var a = document.createElement("a");
			a.href = sb.settings.population_sort[sort_by].source
			a.innerHTML = sb.settings.population_sort[sort_by].source
			stats_source.innerHTML = make_html("h5", "Source:")
			stats_source.appendChild(a);
		}
		else {
			stats_source.innerHTML = "";
		}
	}

	function make_html (tag, text) {
		return "<"+tag+">"+text+"</"+tag+">";
	}
	
	
	function DESTROY () {
		sb.unlisten(this.moduleID)
	}

	return {
        init : INIT,
        set_population: SET_POPULATION,
        set_breakdown: SET_BREAKDOWN,
        destroy : DESTROY
    };
}