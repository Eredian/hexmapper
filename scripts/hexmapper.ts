/// <reference path="utils/domready.d.ts" />

import utils = require('utils/urlObject');

enum ColumnPosition {
    LEFT,
    RIGHT,
}

enum TileColor {
    CAVERN_GROUND,
    MURKY_WATER,
    SWAMP_RIVER,
    LAVA,
    NOTHING
}

enum Mode {
    EDIT,
    EXPLORE
}

export class HexMap {

    hexSideLength: number = 40;
    hexWidth: number = Math.round(Math.sqrt(3) * this.hexSideLength);
    hexHeight: number = 2 * this.hexSideLength;
    selectedHex: string = "";
    defaultMapSize: number = 50;
    defaultMapColor: TileColor = TileColor.CAVERN_GROUND;
    selectedColor: TileColor = this.defaultMapColor;
    defaultMapTile: string = "nothing";
    mode: Mode = Mode.EXPLORE;
    mapTiles: HexMapTiles = new HexMapTiles();
    colorMap: { [key: number]: string } = {};
    baseXPos = this.hexWidth / 2 + 3;
    baseYPos = this.hexHeight / 2 + 3;
    
    url = utils.urlObject({});

    baseImages : { [key: string]: HTMLImageElement};
    canvas = <HTMLCanvasElement> document.getElementById("canvas");
    context = <CanvasRenderingContext2D> this.canvas.getContext("2d");

    constructor() {
        this.colorMap[TileColor.CAVERN_GROUND] = "#B4B4B4";
        this.colorMap[TileColor.NOTHING] = "#000000";
        this.colorMap[TileColor.MURKY_WATER] = "#1919AA";
        this.colorMap[TileColor.SWAMP_RIVER] = "#2D4BC8";
        this.colorMap[TileColor.LAVA] = "#FF3714";

        if (this.url["parameters"]["mode"] == "edit") {
            this.mode = Mode.EDIT;
        } else {
            this.mode = Mode.EXPLORE;
        }
        
        this.loadImages();
    }
    
    loadImages() {
        var xmlhttp = new XMLHttpRequest();
        var url = "getimagenames.php";
        this.baseImages = {};
        var parent = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var imageNames: [string] = JSON.parse(xmlhttp.responseText);
                imageNames.forEach(function(element) {
                    var baseImage = new Image();
                    baseImage.src = "images/"+element;
                    parent.baseImages[element.substr(0, element.length-4)] = baseImage;
                }, parent);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    deleteMap() {
        var canvas = <HTMLCanvasElement> document.getElementById("canvas");
        var context = <CanvasRenderingContext2D> canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    }



    drawMap() {
        this.mapTiles.forEach((x) => this.drawTile(x));
    }

    drawTile(tile: HexTile) {
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
        
        if(tile.image != "nothing" && tile.image != "") {
            var baseImage = this.baseImages[tile.image];
            this.context.drawImage(baseImage, XPos - baseImage.width/2, YPos - baseImage.height/2);
        }
    }
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
    generateNewDefaultMap() {
        this.generateNewMap(this.defaultMapSize, this.defaultMapSize, this.defaultMapTile, this.defaultMapColor);
    }

    generateNewMap(width, height, tileClassName, colorClassName) {
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
                } else {
                    y++;
                    x--;
                }
            }
        }
    }

    selectHex(hexName, colorName) {
        if (hexName != null) {
            this.selectedHex = hexName;
        }
        if (colorName != null) {
            this.selectedColor = colorName;
        }
        var className = "hexcell display " + this.selectedHex + " " + this.selectedColor;
        document.getElementById("selectedInfoDisplay").className = className;
    }


    hexClicked(id) {
        var values = id.split(",");
        var x = parseInt(values[0]);
        var y = parseInt(values[1]);
        var tile = this.mapTiles.get(x, y);
        if (this.mode == Mode.EDIT) {
            tile.image = this.selectedHex;
            tile.color = this.selectedColor;
            this.drawTile(tile);
            //document.getElementById(id).className = "hexcell display " + this.selectedHex + " " + this.selectedColor;
        } else {
            this.mapTiles.forEachInFOV(x, y, (x) => this.explore(x));
        }
    }

    explore(tile: HexTile) {
        if (tile != null) {
            tile.explored = true;
            this.drawTile(tile);
        }
    }

    load() {
        this.loadImages();
        var xmlhttp = new XMLHttpRequest();
        var url = "load.php?filename=" + (<HTMLTextAreaElement>document.getElementById("mapData")).value;

        var parent = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                parent.mapTiles.tiles = JSON.parse(xmlhttp.responseText);
                parent.deleteMap();
                parent.drawMap();
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    save() {
        var xmlhttp = new XMLHttpRequest();
        var url = "save.php?filename=" + (<HTMLTextAreaElement>document.getElementById("mapData")).value;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                alert(xmlhttp.responseText);
            }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send("data=" + JSON.stringify(this.mapTiles.tiles));
    }
    
    up() {
        this.baseYPos += 600;
        this.deleteMap();
        this.drawMap();
    }
    
    down() {
        this.baseYPos -= 600;
        this.deleteMap();
        this.drawMap();
    }
    
    left() {
        this.baseXPos += 800;
        this.deleteMap();
        this.drawMap();
    }
    
    right() {
        this.baseXPos -= 800;
        this.deleteMap();
        this.drawMap();
    }

}

class HexMapTiles {
    // First key is x and second key y
    tiles: { [key: number]: { [key: number]: HexTile } };

    constructor() {
        this.tiles = {};
    }

    add(x: number, y: number, value: HexTile): void {
        if (this.tiles[x] == null) {
            this.tiles[x] = {};
        }
        this.tiles[x][y] = value;
    }

    has(x: number, y: number): boolean {
        if (x in this.tiles) {
            y in this.tiles[x];
        }
        return false;
    }

    get(x: number, y: number): HexTile {
        if (this.tiles[x] != null) {
            return this.tiles[x][y];
        }
        throw new RangeError();
    }

    forEach(func: OperateOnTile) {
        for (var key1 in this.tiles) {
            if (this.tiles.hasOwnProperty(key1)) {
                for (var key2 in this.tiles[key1]) {
                    if (this.tiles[key1].hasOwnProperty(key2)) {
                        func(this.tiles[key1][key2]);
                    }
                }
            }
        }
    }

    forEachInFOV(x: number, y: number, func: OperateOnTile) {
        var tiles: [HexTile] = [this.get(x, y), this.get(x + 1, y), this.get(x, y + 1), this.get(x - 1, y), this.get(x, y - 1), this.get(x + 1, y - 1), this.get(x - 1, y + 1)];
        tiles.map(func);
    }
}

class HexTile {
    x: number;
    y: number;
    color: TileColor;
    image: string;
    explored: boolean = false;
}

interface OperateOnTile {
    (tile: HexTile): any;
}

document.ontouchmove = function(event) {
    event.preventDefault();
};


//domready(function() {


document.addEventListener('touchend', function(e) {
  e.preventDefault();
  var event = document.createEvent('Events');
  event.initEvent('onmouseup', true, false);
  var event2 = document.createEvent('Events');
  event2.initEvent('click', true, false);
  e.srcElement.dispatchEvent(event);
  e.srcElement.dispatchEvent(event2);
})
    var map = new HexMap();
    document.getElementById("mapSaveButton").addEventListener("click", () => map.save());
    document.getElementById("mapLoadButton").addEventListener("click", () => map.load());
    
    document.getElementById("upButton").addEventListener("click", () => map.up());
    document.getElementById("downButton").addEventListener("click", () => map.down());
    document.getElementById("leftButton").addEventListener("click", () => map.left());
    document.getElementById("rightButton").addEventListener("click", () => map.right());

    map.generateNewDefaultMap();
    map.drawMap();
//});

