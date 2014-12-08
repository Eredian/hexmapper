hexSize = 50
selectedHex = ""
defaultMapSize = 40
defautlMapColor = "nothingColor"
selectedColor = defautlMapColor
defaultMapTile = "nothing"
mouseDown = false
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
			stringOutput += '<div class="hexcell hexagon"></div>'
			stringOutput += '<div id="' + row + ',' + column + '" class="hexcell display ' + mapArray[row][column]["tile"] + ' ' + mapArray[row][column]["color"] + '" onmousemove="hexHovered(this.id)" onClick="hexClicked(this.id)">'

			stringOutput += '</div>'
		}
		stringOutput += '</div>'
	}

	document.getElementById("hexmap").innerHTML = stringOutput
}

function generateJsonMap(width, height, tileClassName, colorClassName) {
	var map = []
	for (var row = 0; row < height; row++) {
        map[row] = []
	    for (var column = 0; column < width; column++) {
	        tileData = {}
	        tileData["tile"] = tileClassName
	        tileData["color"] = colorClassName
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
    mapArray[values[0]][values[1]]["tile"] = selectedHex
    mapArray[values[0]][values[1]]["color"] = selectedColor
    document.getElementById(id).className = "hexcell display " + selectedHex + " " + selectedColor
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
    mapArray = JSON.parse(localStorage.getItem("map"))
    deleteMap()
    generateMap()
}

function save() {
    localStorage.setItem("map", JSON.stringify(mapArray))
}

function exportMap() {
    document.getElementById("mapData").value = JSON.stringify(mapArray)
}

function importMap() {

    mapArray = JSON.parse(document.getElementById("mapData").value)
    deleteMap()
    generateMap()
}













window.onload = function () {
    document.onmousedown = down;
    document.onmouseup = up;
    mapArray = generateJsonMap(defaultMapSize, defaultMapSize, defaultMapTile, defautlMapColor)
    generateMap()
}