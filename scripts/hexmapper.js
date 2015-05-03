"use strict";
var url;
function urlObject(options) {
    var url_search_arr;
    var option_key;
    var i;
    var urlObj;
    var get_param;
    var key;
    var val;
    var url_query;
    var url_get_params = {};
    var a = document.createElement('a');
    var default_options = {
        'url': window.location.href,
        'unescape': true,
        'convert_num': true
    };
    if (typeof options !== "object") {
        options = default_options;
    }
    else {
        for (option_key in default_options) {
            if (default_options.hasOwnProperty(option_key)) {
                if (options[option_key] === undefined) {
                    options[option_key] = default_options[option_key];
                }
            }
        }
    }
    a.href = options.url;
    url_query = a.search.substring(1);
    url_search_arr = url_query.split('&');
    if (url_search_arr[0].length > 1) {
        for (i = 0; i < url_search_arr.length; i += 1) {
            get_param = url_search_arr[i].split("=");
            if (options.unescape) {
                key = decodeURI(get_param[0]);
                val = decodeURI(get_param[1]);
            }
            else {
                key = get_param[0];
                val = get_param[1];
            }
            if (options.convert_num) {
                if (val.match(/^\d+$/)) {
                    val = parseInt(val, 10);
                }
                else if (val.match(/^\d+\.\d+$/)) {
                    val = parseFloat(val);
                }
            }
            if (url_get_params[key] === undefined) {
                url_get_params[key] = val;
            }
            else if (typeof url_get_params[key] === "string") {
                url_get_params[key] = [url_get_params[key], val];
            }
            else {
                url_get_params[key].push(val);
            }
            get_param = [];
        }
    }
    urlObj = {
        protocol: a.protocol,
        hostname: a.hostname,
        host: a.host,
        port: a.port,
        hash: a.hash.substr(1),
        pathname: a.pathname,
        search: a.search,
        parameters: url_get_params
    };
    return urlObj;
}
var ColumnPosition;
(function (ColumnPosition) {
    ColumnPosition[ColumnPosition["LEFT"] = 0] = "LEFT";
    ColumnPosition[ColumnPosition["RIGHT"] = 1] = "RIGHT";
})(ColumnPosition || (ColumnPosition = {}));
var TileColor;
(function (TileColor) {
    TileColor[TileColor["CAVERN_GROUND"] = 0] = "CAVERN_GROUND";
    TileColor[TileColor["MURKY_WATER"] = 1] = "MURKY_WATER";
    TileColor[TileColor["SWAMP_RIVER"] = 2] = "SWAMP_RIVER";
    TileColor[TileColor["LAVA"] = 3] = "LAVA";
    TileColor[TileColor["NOTHING"] = 4] = "NOTHING";
})(TileColor || (TileColor = {}));
var Mode;
(function (Mode) {
    Mode[Mode["EDIT"] = 0] = "EDIT";
    Mode[Mode["EXPLORE"] = 1] = "EXPLORE";
})(Mode || (Mode = {}));
var HexMap = (function () {
    function HexMap() {
        this.hexSideLength = 4;
        this.hexWidth = Math.round(Math.sqrt(3) * this.hexSideLength);
        this.hexHeight = 2 * this.hexSideLength;
        this.selectedHex = "";
        this.defaultMapSize = 50;
        this.defaultMapColor = TileColor.CAVERN_GROUND;
        this.selectedColor = this.defaultMapColor;
        this.defaultMapTile = "nothing";
        this.mode = Mode.EXPLORE;
        this.mapTiles = new HexMapTiles();
        this.colorMap = {};
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.colorMap[TileColor.CAVERN_GROUND] = "#B4B4B4";
        this.colorMap[TileColor.NOTHING] = "#000000";
        this.colorMap[TileColor.MURKY_WATER] = "#1919AA";
        this.colorMap[TileColor.SWAMP_RIVER] = "#2D4BC8";
        this.colorMap[TileColor.LAVA] = "#FF3714";
        if (url["parameters"]["mode"] == "edit") {
            this.mode = Mode.EDIT;
        }
        else {
            this.mode = Mode.EXPLORE;
        }
    }
    HexMap.prototype.deleteMap = function () {
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    HexMap.prototype.drawMap = function () {
        var _this = this;
        this.mapTiles.forEach(function (x) { return _this.drawTile(x); });
    };
    HexMap.prototype.drawTile = function (tile) {
        var explored = tile["explored"] || this.mode == Mode.EDIT;
        //stringOutput += '<div class="hexcell '+this.explored+'" id="' + tile["x"] + ',' + tile["y"] + 'explorationlayer" ></div>';
        //stringOutput += '<div id="' + tile["x"] + ',' + tile["y"] + '" class="hexcell display ' + tile["tile"] + ' ' + tile["color"] + '" onmousemove="map.hexHovered(this.id)" onClick="map.hexClicked(this.id)">';
        var baseXPos = this.hexWidth / 2 + 3;
        var baseYPos = this.hexHeight / 2 + 3;
        var XPos = baseXPos + this.hexWidth * (tile.x + tile.y / 2);
        var YPos = baseYPos + this.hexSideLength * tile.y * 1.5;
        this.context.beginPath();
        this.context.moveTo(XPos, YPos - this.hexSideLength);
        this.context.lineTo(XPos + this.hexWidth / 2, YPos - this.hexSideLength / 2);
        this.context.lineTo(XPos + this.hexWidth / 2, YPos + this.hexSideLength / 2);
        this.context.lineTo(XPos, YPos + this.hexSideLength);
        this.context.lineTo(XPos - this.hexWidth / 2, YPos + this.hexSideLength / 2);
        this.context.lineTo(XPos - this.hexWidth / 2, YPos - this.hexSideLength / 2);
        this.context.lineTo(XPos, YPos - this.hexSideLength);
        this.context.lineTo(XPos + this.hexWidth / 2, YPos - this.hexSideLength / 2);
        this.context.fillStyle = this.colorMap[tile.color];
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'black';
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    };
    /*
        addColumn(position : ColumnPosition) {
            for (var row = 0; row < this.mapTiles.length; row++) {
                var cell = {};
                cell["tile"] = this.defaultMapTile;
                cell["color"] = this.defaultMapColor;
                cell["explored"] = false;
                if (position == ColumnPosition.RIGHT) {
                    this.mapTiles[row].push(cell);
                } else {
                    this.mapTiles[row].unshift(cell);
                }
            }
            this.drawMap();
        }
    */
    HexMap.prototype.generateNewDefaultMap = function () {
        this.generateNewMap(this.defaultMapSize, this.defaultMapSize, this.defaultMapTile, this.defaultMapColor);
    };
    HexMap.prototype.generateNewMap = function (width, height, tileClassName, colorClassName) {
        this.mapTiles = new HexMapTiles();
        for (var column = 0; column < width; column++) {
            var x = column;
            var y = 0;
            for (var row = 0; row < height; row++) {
                var tile = new HexTile();
                tile.image = tileClassName;
                tile.color = colorClassName;
                tile.explored = false;
                tile.x = x;
                tile.y = y;
                this.mapTiles.add(x, y, tile);
                if (row % 2 == 0) {
                    y++;
                }
                else {
                    y++;
                    x--;
                }
            }
        }
    };
    HexMap.prototype.selectHex = function (hexName, colorName) {
        if (hexName != null) {
            this.selectedHex = hexName;
        }
        if (colorName != null) {
            this.selectedColor = colorName;
        }
        var className = "hexcell display " + this.selectedHex + " " + this.selectedColor;
        document.getElementById("selectedInfoDisplay").className = className;
    };
    HexMap.prototype.hexClicked = function (id) {
        var _this = this;
        var values = id.split(",");
        var x = parseInt(values[0]);
        var y = parseInt(values[1]);
        var tile = this.mapTiles.get(x, y);
        if (this.mode == Mode.EDIT) {
            tile.image = this.selectedHex;
            tile.color = this.selectedColor;
            this.drawTile(tile);
        }
        else {
            this.mapTiles.forEachInFOV(x, y, function (x) { return _this.explore(x); });
        }
    };
    HexMap.prototype.explore = function (tile) {
        if (tile != null) {
            tile.explored = true;
            this.drawTile(tile);
        }
    };
    HexMap.prototype.load = function () {
        var xmlhttp = new XMLHttpRequest();
        var url = "load.php?filename=" + document.getElementById("mapData").value;
        var parent = this;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                parent.mapTiles.tiles = JSON.parse(xmlhttp.responseText);
                parent.deleteMap();
                parent.drawMap();
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    };
    HexMap.prototype.save = function () {
        var xmlhttp = new XMLHttpRequest();
        var url = "save.php?filename=" + document.getElementById("mapData").value;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                alert(xmlhttp.responseText);
            }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send("data=" + JSON.stringify(this.mapTiles.tiles));
    };
    return HexMap;
})();
var HexMapTiles = (function () {
    function HexMapTiles() {
        this.tiles = {};
    }
    HexMapTiles.prototype.add = function (x, y, value) {
        if (this.tiles[x] == null) {
            this.tiles[x] = {};
        }
        this.tiles[x][y] = value;
    };
    HexMapTiles.prototype.has = function (x, y) {
        if (x in this.tiles) {
            y in this.tiles[x];
        }
        return false;
    };
    HexMapTiles.prototype.get = function (x, y) {
        if (this.tiles[x] != null) {
            return this.tiles[x][y];
        }
        throw new RangeError();
    };
    HexMapTiles.prototype.forEach = function (func) {
        for (var key1 in this.tiles) {
            if (this.tiles.hasOwnProperty(key1)) {
                for (var key2 in this.tiles[key1]) {
                    if (this.tiles[key1].hasOwnProperty(key2)) {
                        func(this.tiles[key1][key2]);
                    }
                }
            }
        }
    };
    HexMapTiles.prototype.forEachInFOV = function (x, y, func) {
        var tiles = [this.get(x, y), this.get(x + 1, y), this.get(x, y + 1), this.get(x - 1, y), this.get(x, y - 1), this.get(x + 1, y - 1), this.get(x - 1, y + 1)];
        tiles.map(func);
    };
    return HexMapTiles;
})();
var HexTile = (function () {
    function HexTile() {
        this.explored = false;
    }
    return HexTile;
})();
document.ontouchmove = function (event) {
    event.preventDefault();
};
window.onload = function () {
    url = urlObject({});
    var map = new HexMap();
    map.generateNewDefaultMap();
    map.drawMap();
    document.getElementById("mapSaveButton").addEventListener("click", function () { return map.save(); });
    document.getElementById("mapLoadButton").addEventListener("click", function () { return map.load(); });
};
//# sourceMappingURL=hexmapper.js.map