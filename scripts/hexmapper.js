/// <reference path="utils/domready.d.ts" />
define(["require", "exports", 'utils/urlObject'], function (require, exports, utils) {
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
            this.hexSideLength = 40;
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
            this.baseXPos = this.hexWidth / 2 + 3;
            this.baseYPos = this.hexHeight / 2 + 3;
            this.url = utils.urlObject({});
            this.canvas = document.getElementById("canvas");
            this.context = this.canvas.getContext("2d");
            this.colorMap[TileColor.CAVERN_GROUND] = "#B4B4B4";
            this.colorMap[TileColor.NOTHING] = "#000000";
            this.colorMap[TileColor.MURKY_WATER] = "#1919AA";
            this.colorMap[TileColor.SWAMP_RIVER] = "#2D4BC8";
            this.colorMap[TileColor.LAVA] = "#FF3714";
            if (this.url["parameters"]["mode"] == "edit") {
                this.mode = Mode.EDIT;
            }
            else {
                this.mode = Mode.EXPLORE;
            }
            this.loadImages();
        }
        HexMap.prototype.loadImages = function () {
            var xmlhttp = new XMLHttpRequest();
            var url = "getimagenames.php";
            this.baseImages = {};
            var parent = this;
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var imageNames = JSON.parse(xmlhttp.responseText);
                    imageNames.forEach(function (element) {
                        var baseImage = new Image();
                        baseImage.src = "images/" + element;
                        parent.baseImages[element.substr(0, element.length - 4)] = baseImage;
                    }, parent);
                }
            };
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        };
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
            //stringOutput += '<div id="' + tile["x"] + ',' + tile["y"] + '" class="hexcell display ' + tile["tile"] + ' ' + tile["color"] + '" onmousemove="map.hexHovered(this.id)" onClick="map.hexClicked(this.id)">';
            var XPos = this.baseXPos + this.hexWidth * (tile.x + tile.y / 2);
            var YPos = this.baseYPos + this.hexSideLength * tile.y * 1.5;
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
            if (tile.image != "nothing" && tile.image != "") {
                var baseImage = this.baseImages[tile.image];
                this.context.drawImage(baseImage, XPos - baseImage.width / 2, YPos - baseImage.height / 2);
            }
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
            this.loadImages();
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
        HexMap.prototype.up = function () {
            this.baseYPos += 600;
            this.deleteMap();
            this.drawMap();
        };
        HexMap.prototype.down = function () {
            this.baseYPos -= 600;
            this.deleteMap();
            this.drawMap();
        };
        HexMap.prototype.left = function () {
            this.baseXPos += 800;
            this.deleteMap();
            this.drawMap();
        };
        HexMap.prototype.right = function () {
            this.baseXPos -= 800;
            this.deleteMap();
            this.drawMap();
        };
        return HexMap;
    })();
    exports.HexMap = HexMap;
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
    //domready(function() {
    document.addEventListener('touchend', function (e) {
        e.preventDefault();
        var event = document.createEvent('Events');
        event.initEvent('onmouseup', true, false);
        var event2 = document.createEvent('Events');
        event2.initEvent('click', true, false);
        e.srcElement.dispatchEvent(event);
        e.srcElement.dispatchEvent(event2);
    });
    var map = new HexMap();
    document.getElementById("mapSaveButton").addEventListener("click", function () { return map.save(); });
    document.getElementById("mapLoadButton").addEventListener("click", function () { return map.load(); });
    document.getElementById("upButton").addEventListener("click", function () { return map.up(); });
    document.getElementById("downButton").addEventListener("click", function () { return map.down(); });
    document.getElementById("leftButton").addEventListener("click", function () { return map.left(); });
    document.getElementById("rightButton").addEventListener("click", function () { return map.right(); });
    map.generateNewDefaultMap();
    map.drawMap();
});
//});
//# sourceMappingURL=hexmapper.js.map