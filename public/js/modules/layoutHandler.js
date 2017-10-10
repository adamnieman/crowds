function layoutHandler (sb) {
	
	var pack = d3.pack()
		.radius(function (d) {
			return d.data.get_radius()
		})
		.padding(sb.font_size);

	function INIT () {

		sb.listen({
			listenFor: ["population-create-init"],
			moduleID: this.moduleID,
			moduleFunction: "create_layout"
		})

		sb.listen({
			listenFor: ["population-unsort-init"],
			moduleID: this.moduleID,
			moduleFunction: "unsort_layout"
		})

		sb.listen({
			listenFor: ["population-sort-init"],
			moduleID: this.moduleID,
			moduleFunction: "sort_layout"
		})

		sb.resize.push(RESIZE);
	}

	function RESIZE () {
		if (sb.population.is_set()) {
			
			get_multiplier();
		}

		sb.notify({
			type : "resize-trigger",
			data: null,
		})
	}


	function unsort () {
		var unsorted_crowd = sb.population.get_unsorted_crowd()

		sb.crowds.cw = unsorted_crowd.get_radius()+(sb.font_size*3)
		sb.crowds.ch = unsorted_crowd.get_radius()+(sb.font_size*3)

		sb.crowds.offset.x = 0;
		sb.crowds.offset.y = 0;

		get_multiplier()
	}

	function CREATE_LAYOUT () {
		unsort ()
		sb.notify({
			type : "population-create-complete",
			data: null,
		});
	}

	function UNSORT_LAYOUT (d) {
		/*var unsorted_crowd = sb.population.get_unsorted_crowd()

		sb.crowds.cw = unsorted_crowd.get_radius()+(sb.font_size*3)
		sb.crowds.ch = unsorted_crowd.get_radius()+(sb.font_size*3)

		sb.crowds.offset.x = 0;
		sb.crowds.offset.y = 0;

		get_multiplier()*/

		unsort()
		sb.notify({
			type : "population-unsort-complete",
			data: null,
		});
	}

	function SORT_LAYOUT () {

		var sorted_crowds = sb.population.get_sorted_crowds()
		var packed = pack(d3.hierarchy({children: sorted_crowds})).children;
		
		//these represent the min and max limits of the crowds, and are used for calculating the multiplier
		var x = [Infinity, -Infinity];
		var y = [Infinity, -Infinity];

		var i;
		//variable c will hold the current crowd during the loop.
		var c;
		var l = sorted_crowds.length;

		for (i=0; i<l; i++) {
			c = sorted_crowds[i]
			c.set_offset(packed[i].x, packed[i].y);

			//stores min and max bounds of crowds in x and y
			if (c.get_offset().x-c.get_radius() < x[0]) {x[0] = c.get_offset().x-c.get_radius()}
			if (c.get_offset().x+c.get_radius() > x[1]) {x[1] = c.get_offset().x+c.get_radius()}
			if (c.get_offset().y-c.get_radius() < y[0]) {y[0] = c.get_offset().y-c.get_radius()}
			if (c.get_offset().y+c.get_radius() > y[1]) {y[1] = c.get_offset().y+c.get_radius()}
		}

		sb.crowds.cw = Math.abs(x[1] - x[0])+(sb.font_size*2)// + sb.fontSize*2;
		sb.crowds.ch = Math.abs(y[1] - y[0])+(sb.font_size*2)// + sb.fontSize*2;

		sb.crowds.offset.x = ((sb.crowds.cw/2) - x[1])- sb.font_size*1
		sb.crowds.offset.y = ((sb.crowds.ch/2) - y[1])- sb.font_size*1 //+ sb.fontSize

		get_multiplier()

		sb.notify({
			type : "population-sort-complete",
			data: null,
		});

	}

	function get_multiplier () {

		var padding = sb.font_size

		sb.crowds.multiplier = (sb.h-(padding*2))/sb.crowds.ch > (sb.w-(padding*2))/sb.crowds.cw ? (sb.w-(padding*2))/sb.crowds.cw : (sb.h-(padding*2))/sb.crowds.ch;
		sb.crowds.multiplier = utility.round(sb.crowds.multiplier, 2);
		//debug.dbg("The multiplier is: "+sb.crowds.multiplier)
	}
	
	function DESTROY () {
		sb.unlisten(this.moduleID)
	}

	return {
        init : INIT,
        resize: RESIZE,
        unsort_layout: UNSORT_LAYOUT,
        create_layout: CREATE_LAYOUT,
        sort_layout: SORT_LAYOUT,
        destroy : DESTROY
    };
}