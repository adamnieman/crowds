<?php
	$settings_location = "settings.json";
	$settings = json_decode(file_get_contents($settings_location));
?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Vollkorn">
  
		<link rel="stylesheet" type="text/css" href="css/reset.css">
		<link rel="stylesheet" type="text/css" href="css/toggle.css">
		<link rel="stylesheet" type="text/css" href="css/desktop.css">

		<script src = "js/libs/d3.js"></script>
		<script src = "js/libs/three.js"></script>
		<script src = "js/libs/OrbitControls.js"></script>

		<script src = "js/debug.js"></script>
		<script src = "js/utility.js"></script>
		<script src = "js/index.js"></script>
		<script src = "js/core.js"></script>
	</head>
	<body>
	<div id = "main-container">
	 <div id = "input-container">
	 	<h1>Explore the British Population</h1>
	 	<div id = "input-a" class="input">
	 		<p>Input size of representative population here</p>
	 		<p>
		 		<input id = "population_size" type="number" max= 
		 		<?php echo $settings->population_size->max;?> 
		 		min = 
		 		<?php echo $settings->population_size->min;?>
		 		>
		 		<button id = "population_size_submit">go</button>
	 		</p>
	 		<p>(max <?php echo $settings->population_size->max; ?>)</p>

	 		<input class ="select-context-rb" type="radio" name="select-context" value="3d" checked = "checked">3D
  			<input class ="select-context-rb" type="radio" name="select-context" value="2d">2D

	 		<!--<select id = "select-context">
	 			<option value = "2d">2D</option>
	 			<option value = "3d" selected="selected">3D</option>
	 		</select>-->
	 	</div>
	 	<div id = "input-b" class="input">
	 		<p>Select how to sort the population here</p>
	 		<?php
	 			foreach ($settings->population_sort as $key => $value) {
				    echo "<p><button class='sort-control' id='sort-$key' value=$key >$key</button></p>";
				}
	 		?>
	 		<p><button class = "unsort-control" id = "unsort" value= "unsort">unsort</button></p>
	 	</div>
	 	<!--<div id = "input-c" class="input">
	 		<select id = "select-context">
	 			<option value = "2d">2D</option>
	 			<option value = "3d" selected="selected">3D</option>
	 		</select>
	 	</div>-->
	 	<div id = "output-stats">
	 		
	 		<div id = "output-stats-population"></div>
	 		<div id = "output-stats-breakdown"></div>
	 		<div id = "output-stats-notes"></div>
	 		<div id = "output-stats-source"></div>

	 	</div>
	 	<div id = logo-container>
	 		<a href = "http://www.realworldvisuals.com/"><img id = "logo" src = "assets/logo.svg"></a>
	 	</div>
	 </div>
	 <div id = "output-container">
	 	<div id = "svg-container"  ></div>
	 	<div id = "canvas-container" class = "active"></div>
	 </div>
	</div>
	<div id="test"></div>
	</body>
</html>