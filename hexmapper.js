/* global map */
/* global mouseDown */
function getUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

mouseDown = false;

function down() {
    mouseDown = true;
    return;
}

function up() {
    mouseDown = false;
    return;
}

function Map() {

    // Add object properties like this
    this.hexSize = 50;
    this.selectedHex = "";
    this.defaultMapSize = 40;
    this.defaultMapColor = "nothingColor";
    this.selectedColor = this.defaultMapColor;
    this.defaultMapTile = "nothing";
    this.mode = "explore";
    this.mapArray = {};
    
    if(getUrlVars()["mode"] != "") {
    	this.mode = getUrlVars()["mode"];
    } else {
    	this.mode = "explore";
    }
}

Map.prototype.deleteMap = function() {
	document.getElementById("hexmap").innerHTML = "";
};

Map.prototype.drawMap = function() {
	var stringOutput = "";
	for(var row = 0; row < this.mapArray.length; row++) {
		if(row%2==0) {
			stringOutput += '<div class="evenhexrow">';
		} else {
			stringOutput += '<div class="oddhexrow">';
		}
		for (var column = 0; column < this.mapArray[row].length; column++) {
			this.explored = "hidden";
			if(this.mapArray[row][column]["explored"] || this.mode == "edit") {
				this.explored = "explored";
			}
			stringOutput += '<div class="hexcell hexagon"></div>';
			stringOutput += '<div class="hexcell '+this.explored+'" id="' + row + ',' + column + 'explorationlayer" ></div>';
			stringOutput += '<div id="' + row + ',' + column + '" class="hexcell display ' + this.mapArray[row][column]["tile"] + ' ' + this.mapArray[row][column]["color"] + '" onmousemove="map.hexHovered(this.id)" onClick="map.hexClicked(this.id)">';

			stringOutput += '</div>';
		}
		stringOutput += '</div>';
	}

	document.getElementById("hexmap").innerHTML = stringOutput;
};

Map.prototype.addColumn = function(position) {
	for (var row = 0; row < this.mapArray.length; row++) {
		var tileData = {};
		tileData["tile"] = this.defaultMapTile;
		tileData["color"] = this.defautlMapColor;
		tileData["explored"] = false;
		if (position == "right") {
			this.mapArray[row].push(tileData);
		} else {
			this.mapArray[row].unshift(tileData);
		}
	}	
	this.drawMap();
};

Map.prototype.generateNewDefaultMap = function() {
	this.generateNewMap(this.defaultMapSize, this.defaultMapSize, this.defaultMapTile, this.defautlMapColor);
};

Map.prototype.generateNewMap = function(width, height, tileClassName, colorClassName) {
	var map = [];
	for (var row = 0; row < height; row++) {
        map[row] = [];
	    for (var column = 0; column < width; column++) {
	        var tileData = {};
	        tileData["tile"] = tileClassName;
	        tileData["color"] = colorClassName;
	        tileData["explored"] = false;
	        map[row][column] = tileData;
	    }
	}
	this.mapArray = map;
};

Map.prototype.selectHex = function(hexName, colorName) {
    if(hexName != null) {
        this.selectedHex = hexName;
    }
    if (colorName != null) {
        this.selectedColor = colorName;
    }
    var className = "hexcell display " + this.selectedHex + " " + this.selectedColor;
    document.getElementById("selectedInfoDisplay").className = className;
};

Map.prototype.hexHovered = function(id) {
    if (mouseDown) {
        this.hexClicked(id);
    }
};

Map.prototype.hexClicked = function(id) {
    var values = id.split(",");
	if(this.mode=="edit") {
		this.mapArray[values[0]][values[1]]["tile"] = this.selectedHex;
		this.mapArray[values[0]][values[1]]["color"] = this.selectedColor;
		document.getElementById(id).className = "hexcell display " + this.selectedHex + " " + this.selectedColor;
	} else {
		this.x = parseInt(values[0]);
		this.y = parseInt(values[1]);
		if(this.x%2 == 0){
			this.explore(this.x,this.y);
			this.explore(this.x+1,this.y-1);
			this.explore(this.x-1,this.y-1);
			this.explore(this.x,this.y-1);
			this.explore(this.x-1,this.y);
			this.explore(this.x,this.y+1);
			this.explore(this.x+1,this.y);
		} else {
			this.explore(this.x,this.y);
			this.explore(this.x+1,this.y);
			this.explore(this.x-1,this.y);
			this.explore(this.x,this.y-1);
			this.explore(this.x-1,this.y+1);
			this.explore(this.x,this.y+1);
			this.explore(this.x+1,this.y+1);
		}
	}
};

Map.prototype.explore = function(x,y) {
	if(this.mapArray[x][y] != null) {
		this.mapArray[x][y]["explored"] = true;
		var element = document.getElementById(x+","+y+"explorationlayer");
		if(element != null) {
			element.className = "hexcell explored";
		}
	}
};

Map.prototype.load = function() {
    var xmlhttp = new XMLHttpRequest();
	var url = "load.php?filename="+document.getElementById("mapData").value;

    var parent = this;
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			parent.mapArray = JSON.parse(xmlhttp.responseText);
			parent.deleteMap();
			parent.drawMap();
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
};

Map.prototype.save = function() {
	var xmlhttp = new XMLHttpRequest();
	var url = "save.php?filename="+document.getElementById("mapData").value;

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			alert(xmlhttp.responseText);
		}
	};
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send("data="+JSON.stringify(this.mapArray));
};

window.onload = function () {
    document.onmousedown = down;
    document.onmouseup = up;
    
    map = new Map();
    
    map.generateNewDefaultMap();
    map.drawMap();
};