function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}


hexSize = 50
selectedHex = ""
defaultMapSize = 40
defautlMapColor = "nothingColor"
selectedColor = defautlMapColor
defaultMapTile = "nothing"
mouseDown = false
var mode
if(getUrlVars()["mode"] != "") {
	mode = getUrlVars()["mode"]
} else {
	mode = "explore"
}
var mapArray

function deleteMap() {
	document.getElementById("hexmap").innerHTML = ""
}

function generateMap() {
	var stringOutput = ""
	for(var row = 0; row < mapArray.length; row++) {
		if(row%2==0) {
			stringOutput += '<div class="evenhexrow">'
		} else {
			stringOutput += '<div class="oddhexrow">'
		}
		for (var column = 0; column < mapArray[row].length; column++) {
			explored = "hidden";
			if(mapArray[row][column]["explored"] || mode == "edit") {
				explored = "explored"
			}
			stringOutput += '<div class="hexcell hexagon"></div>'
			stringOutput += '<div class="hexcell '+explored+'" id="' + row + ',' + column + 'explorationlayer" ></div>'
			stringOutput += '<div id="' + row + ',' + column + '" class="hexcell display ' + mapArray[row][column]["tile"] + ' ' + mapArray[row][column]["color"] + '" onmousemove="hexHovered(this.id)" onClick="hexClicked(this.id)">'

			stringOutput += '</div>'
		}
		stringOutput += '</div>'
	}

	document.getElementById("hexmap").innerHTML = stringOutput
}

function addColumn(position) {
	for (var row = 0; row < mapArray.length; row++) {
		tileData = {}
		tileData["tile"] = defaultMapTile
		tileData["color"] = defautlMapColor
		tileData["explored"] = false
		if (position == "right") {
			mapArray[row].push(tileData)
		} else {
			mapArray[row].unshift(tileData)
		}
	}	
	generateMap()
}

function generateJsonMap(width, height, tileClassName, colorClassName) {
	var map = []
	for (var row = 0; row < height; row++) {
        map[row] = []
	    for (var column = 0; column < width; column++) {
	        tileData = {}
	        tileData["tile"] = tileClassName
	        tileData["color"] = colorClassName
	        tileData["explored"] = false
	        map[row][column] = tileData
	    }
	}
	return map
}

function selectHex(hexName, colorName) {
    if(hexName != null) {
        selectedHex = hexName
    }
    if (colorName != null) {
        selectedColor = colorName
    }
    document.getElementById("selectedInfoDisplay").className = "hexcell display " + selectedHex + " " + selectedColor
}

function hexHovered(id) {
    if (mouseDown) {
        hexClicked(id)
    }
}

function hexClicked(id) {
    var values = id.split(",")
	if(mode=="edit") {
		mapArray[values[0]][values[1]]["tile"] = selectedHex
		mapArray[values[0]][values[1]]["color"] = selectedColor
		document.getElementById(id).className = "hexcell display " + selectedHex + " " + selectedColor
	} else {
		x = parseInt(values[0])
		y = parseInt(values[1])
		if(x%2==0){
			explore(x,y)
			explore(x+1,y-1)
			explore(x-1,y-1)
			explore(x,y-1)
			explore(x-1,y)
			explore(x,y+1)
			explore(x+1,y)
		} else {
			explore(x,y)
			explore(x+1,y)
			explore(x-1,y)
			explore(x,y-1)
			explore(x-1,y+1)
			explore(x,y+1)
			explore(x+1,y+1)
		}
	}
}

function explore(x,y) {
	if(mapArray[x][y] != null) {
		mapArray[x][y]["explored"] = true
		element = document.getElementById(x+","+y+"explorationlayer")
		if(element != null) {
			element.className = "hexcell explored";
		}
	}
}

function down() {
    mouseDown = true;
    return;
}

function up() {
    mouseDown = false;
    return;
}

function load() {
    var xmlhttp = new XMLHttpRequest()
	var url = "load.php?filename="+document.getElementById("mapData").value

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			mapArray = JSON.parse(xmlhttp.responseText)
			deleteMap()
			generateMap()
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function save() {
	var xmlhttp = new XMLHttpRequest()
	var url = "save.php?filename="+document.getElementById("mapData").value

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			alert(xmlhttp.responseText);
		}
	}
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send("data="+JSON.stringify(mapArray));
}
/*
function exportMap() {
    document.getElementById("mapData").value = JSON.stringify(mapArray)
}

function importMap() {

    mapArray = JSON.parse(document.getElementById("mapData").value)
    deleteMap()
    generateMap()
}
*/












window.onload = function () {
    document.onmousedown = down;
    document.onmouseup = up;
    mapArray = generateJsonMap(defaultMapSize, defaultMapSize, defaultMapTile, defautlMapColor)
    generateMap()
}