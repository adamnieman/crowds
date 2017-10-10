function sortHandler (sb) {

	var request_url;
	var unsort_control = document.getElementById("unsort");
	var sort_controls = document.getElementsByClassName("sort-control");
	var sort_categories = {};
	
	function INIT () {
		sb.listen({
			listenFor: ["setup-complete"],
			moduleID: this.moduleID,
			moduleFunction: "set_url"
		})

		sb.listen({
			listenFor: ["population-sort-category-crowd"],
			moduleID: this.moduleID,
			moduleFunction: "set_sort_category_crowd"
		})

		var i;
		var l = sort_controls.length
		for (i=0; i<l; i++) {
			sb.addEvent(sort_controls[i], "click", split_population);
		}

		sb.addEvent(unsort, "click", unsort_population);
	}

	function SET_URL () {
		request_url = sb.settings.crowd_request_url+"?value="+sb.settings.population_spread.min+" "+sb.settings.population_spread.max+" ";
	}

	function SET_SORT_CATEGORY_CROWD (d) {

		var crowd = new index.Crowd(d.data.length);
		crowd.set_points(d.data);

		if (debug.sentinel(crowd.is_set(), "Crowd failed to initialise correctly.")) {
			return;
		}

		sb.population.set_sorted_crowd(d.id, crowd);

		delete sort_categories[d.id];

		if (Object.keys(sort_categories).length == 0) {

			sb.notify({
				type : "population-sort-init",
				data: null
			});
		}
	}

	function unsort_population () {

		sb.population.unsort()

		sb.notify({
			type : "population-unsort-init",
			data: null,
		});
	}

	function split_population () {
		
		sort_categories = {};

		var sort_by = this.value;
		var _sort_categories = sb.settings.population_sort[sort_by].categories;

		var minor_groups = {
			percent: 0,
			decimal: 0,
			categories: [],
		};

		//for every category, calculates the number of people as a floating point number.
		//if that number is greater than zero but less than 0.5, (existent but would not round to a whole person) the category is added to minor groups
		//each category is now assigned an integral number of people by rounding it's floating point number
		//the decimal remainder is calculated so we can see which category was the closest to having another person
		for (var propt in _sort_categories) {

			sort_categories[propt] = {}
			sort_categories[propt].decimal = _sort_categories[propt]/100*sb.population.get_size();

			if (sort_categories[propt].decimal < 0.5 && sort_categories[propt].decimal > 0) {
				minor_groups.decimal += sort_categories[propt].decimal;
				minor_groups.percent += _sort_categories[propt];
				minor_groups.categories.push(propt);
			}

			sort_categories[propt].integer = Math.round(sort_categories[propt].decimal);
			sort_categories[propt].decimal_remainder = sort_categories[propt].decimal%1;
			if (sort_categories[propt].decimal_remainder >= 0.5) {sort_categories[propt].decimal_remainder -= 1}
		}	
		//if there is more than one category in minor groups, remove those categories from the list and add a new category "minor groups" instead
		if (minor_groups.categories.length > 1) {
			sb.minor_groups = {}
			sb.minor_groups.categories = []
			sb.minor_groups.percent = minor_groups.percent;
			minor_groups.categories.forEach(function (propt) {
				sb.minor_groups.categories.push(propt);
				delete sort_categories[propt];
			})
			minor_groups.integer = Math.round(minor_groups.decimal);
			minor_groups.decimal_remainder = minor_groups.decimal%1;
			sort_categories["minor groups"] = minor_groups;
		}
		else {
			sb.minor_groups = null;
		}
		
		
		//while the number of people we do have is less than the number of people we should have, add one person to the most deserving category (the one with the largest fractional part of a person).
		
		while (countProperty(sort_categories, "integer") < sb.population.get_size()) {
			var category = select_category_for_increment()
			sort_categories[category].integer++
			sort_categories[category].decimal_remainder = -1 + sort_categories[category].decimal_remainder
		
		}
		while (countProperty(sort_categories, "integer") > sb.population.get_size()) {
			
			var category = select_category_for_decrement()
			sort_categories[category].integer--
			sort_categories[category].decimal_remainder = 1 + sort_categories[category].decimal_remainder
		}

		sb.population.set_sort_by(sort_by, Object.keys(sort_categories));

		for (var propt in sort_categories) {
			sb.notify({
				type : "http-get",
				data: {
					id: propt,
					url: request_url+sort_categories[propt].integer,
					responseType: "population-sort-category-crowd",
				}
			});
		}

	}

	function select_category_for_increment () {
		
		var value = -Infinity;
		var _propt;

		for (var propt in sort_categories) {
			if (sort_categories[propt].decimal_remainder > value) {
				_propt = propt;
				value = sort_categories[propt].decimal_remainder 
			}
			else if (sort_categories[propt].decimal_remainder >= value &&
				sort_categories[propt].integer < sort_categories[_propt].integer) {
				_propt = propt;
			}
		}
		return _propt;
	}

	function select_category_for_decrement () {
		
		var value = Infinity;
		var _propt;

		for (var propt in sort_categories) {
			if (sort_categories[propt].decimal_remainder < value) {
				_propt = propt;
				value = sort_categories[propt].decimal_remainder 
			}
			else if (sort_categories[propt].decimal_remainder <= value &&
				sort_categories[propt].integer > sort_categories[_propt].integer) {
				_propt = propt;
			}
		}
		return _propt;
	}

	function countProperty (object, property) {
		var count = 0;
		for (var propt in object) {
			count += object[propt][property];
		}
		return count;
	}
	
	function DESTROY () {
		sb.unlisten(this.moduleID)
	}

	return {
        init : INIT,
        set_url: SET_URL,
        set_sort_category_crowd: SET_SORT_CATEGORY_CROWD,
        destroy : DESTROY
    };
}