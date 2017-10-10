function requestHandler (sb) {
	function INIT () {
		sb.listen({
			listenFor: ["http-get"],
			moduleID: this.moduleID,
			moduleFunction: "get", 
		})
	}

	function GET (d) {
		var id = d.hasOwnProperty("id") ? d.id : null;
		httpGet(d.url, d.responseType, id)
	}
	
	function httpGet(url, responseType, id) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				sb.notify({
					type : responseType,
					data: {

						data: JSON.parse(xmlHttp.responseText),
						id: id,
					},
				})
			}
			else if (xmlHttp.readyState == 4 && xmlHttp.status == 404) {
				debug.sentinel(false, "Resource not found at '"+url+"'.") 
			}
		}
		xmlHttp.open("GET", url, true); // true for asynchronous
		xmlHttp.send(null);
	}

	function DESTROY () {
		sb.unlisten(this.moduleID)
		httpGet = null;
	}

	return {
		get: GET,
        init : INIT,
        destroy : DESTROY
    };
}