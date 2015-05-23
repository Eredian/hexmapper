/// <reference path="utils/urlobject.ts" />

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

class HexMap {

    hexSideLength: number;
    strokeLineWidth: number;
    hexWidth: number;
    hexHeight: number;
    baseXPos: number = 0;
    baseYPos: number = 0;
    
    selectedHex: string = "";
    defaultMapSize: number = 50;
    zoomLevel: number = 1;
    defaultMapColor: TileColor = TileColor.CAVERN_GROUND;
    selectedColor: TileColor = this.defaultMapColor;
    defaultMapTile: string = "nothing";
    mode: Mode = Mode.EXPLORE;
    mapTiles: HexMapTiles = new HexMapTiles();
    colorMap: { [key: number]: string } = {};
    zoomLevelMap: {[key: number]: [number, number]} = {};
    
    url = utils.urlObject({});

    baseImages : { [key: string]: HTMLImageElement};
    canvas = <HTMLCanvasElement> document.getElementById("canvas");
    context = <CanvasRenderingContext2D> this.canvas.getContext("2d");

    mouseHeld: boolean = false;

    constructor() {
        this.colorMap[TileColor.CAVERN_GROUND] = "#B4B4B4";
        this.colorMap[TileColor.NOTHING] = "#000000";
        this.colorMap[TileColor.MURKY_WATER] = "#1919AA";
        this.colorMap[TileColor.SWAMP_RIVER] = "#2D4BC8";
        this.colorMap[TileColor.LAVA] = "#FF3714";
        
        this.zoomLevelMap[0] = [6,1];
        this.zoomLevelMap[1] = [35,3];
        this.zoomLevelMap[2] = [80,5];
        
        if (this.url["parameters"]["mode"] == "edit") {
            this.mode = Mode.EDIT;
        } else {
            this.mode = Mode.EXPLORE;
        }
        
        this.updateHexDimensions(1);
        
        this.loadImages();
        
        this.canvas.addEventListener("click", (e) => this.click(e));
        this.canvas.addEventListener("mousedown", (e) => this.click(e));
        this.canvas.addEventListener("mouseup", (e) => this.click(e));
        this.canvas.addEventListener("mousemove", (e) => this.click(e));
    }
    
    updateHexDimensions(zoomLevel: number) {
        this.hexSideLength = this.zoomLevelMap[zoomLevel][0];
        this.strokeLineWidth = this.zoomLevelMap[zoomLevel][1];
        this.hexWidth = Math.round(Math.sqrt(3) * this.hexSideLength);
        this.hexHeight = 2 * this.hexSideLength;
    }
    
    zoomIn() {
        this.baseXPos *= this.zoomLevelMap[this.zoomLevel+1][0]/this.zoomLevelMap[this.zoomLevel][0];
        this.baseYPos *= this.zoomLevelMap[this.zoomLevel+1][0]/this.zoomLevelMap[this.zoomLevel][0];
        this.zoomLevel++;
        this.updateHexDimensions(this.zoomLevel);
        this.deleteMap();
        this.drawMap();
    }
    
    zoomOut() {
        this.baseXPos *= this.zoomLevelMap[this.zoomLevel-1][0]/this.zoomLevelMap[this.zoomLevel][0];
        this.baseYPos *= this.zoomLevelMap[this.zoomLevel-1][0]/this.zoomLevelMap[this.zoomLevel][0];
        this.zoomLevel--;
        this.updateHexDimensions(this.zoomLevel);
        this.deleteMap();
        this.drawMap();
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
        
        if(explored) {
            this.context.fillStyle = this.colorMap[tile.color];
        } else {
            this.context.fillStyle = "#FFCC66";
        }
        this.context.lineWidth = this.strokeLineWidth;
        this.context.strokeStyle = 'black';
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
        
        if(tile.image != "nothing" && tile.image != "" && this.hexSideLength > 20 && explored) {
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
        var mapName: string = prompt("Enter map name.");
        if (mapName == null) {
            return;
        }
        this.loadImages();
        var xmlhttp = new XMLHttpRequest();
        var url = "load.php?filename=" + mapName;

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
        var mapName: string = prompt("Enter map name.");
        if (mapName == null) {
            return;
        }
        var xmlhttp = new XMLHttpRequest();
        var url = "save.php?filename=" + mapName;
        
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
        this.baseYPos += 374;
        this.deleteMap();
        this.drawMap();
    }
    
    down() {
        this.baseYPos -= 374;
        this.deleteMap();
        this.drawMap();
    }
    
    left() {
        this.baseXPos += 512;
        this.deleteMap();
        this.drawMap();
    }
    
    right() {
        this.baseXPos -= 512;
        this.deleteMap();
        this.drawMap();
    }
    
    pixel_to_hex(x: number, y: number) {
        var q = (x * Math.sqrt(3)/3 - y / 3) / this.hexSideLength;
        var r = y * 2/3 / this.hexSideLength;
        var hexPosition = this.hex_round(q, r);
        return this.mapTiles.get(hexPosition[0], hexPosition[1]);
    }
    
    hex_round(q: number, r: number) {
        var x: number = q;
        var z: number = r;
        var y: number = -x-z;
        
        var rx: number = Math.round(x);
        var ry: number = Math.round(y);
        var rz: number = Math.round(z);
    
        var x_diff: number = Math.abs(rx - x);
        var y_diff: number = Math.abs(ry - y);
        var z_diff: number = Math.abs(rz - z);
    
        if (x_diff > y_diff && x_diff > z_diff) {
            rx = -ry-rz;
        } else if (y_diff > z_diff) {
            ry = -rx-rz;
        } else {
            rz = -rx-ry;
        }
        return [rx, rz];
    }
    
    click(e: MouseEvent) {
        if(e.type == "mousedown") {
            this.mouseHeld = true;
        } else if(e.type == "mouseup") {
            this.mouseHeld = false;
        }
        if(e.type != "mousemove" || this.mouseHeld == true) {
            var hex: HexTile = this.pixel_to_hex(e.clientX-this.baseXPos, e.clientY-this.baseYPos);
            this.mapTiles.forEachInFOV(hex.x, hex.y, (e) => this.explore(e));
        }
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


document.addEventListener("touchstart", function(e: TouchEvent) {
    e.preventDefault();
    var touches = e.changedTouches;
    
    for (var i=0; i < touches.length; i++) {
        var event: MouseEvent = new MouseEvent("onmousedown", {clientX:touches[i].clientX,clientY:touches[i].clientY});
        event.initEvent('mousedown', true, false);
        e.target.dispatchEvent(event);
    }
});
document.addEventListener('touchend', function(e: TouchEvent) {
    e.preventDefault();
    var touches = e.changedTouches;
  
    for (var i=0; i < touches.length; i++) {
        /*var event: MouseEvent = new MouseEvent("onmouseup", {clientX:touches[i].clientX,clientY:touches[i].clientY});
        event.initEvent('mouseup', true, false);
        e.target.dispatchEvent(event);*/
        var event2: MouseEvent = new MouseEvent("onclick", {clientX:touches[i].clientX,clientY:touches[i].clientY});
        event2.initEvent('click', true, false);
        e.target.dispatchEvent(event2);
    }
});
//document.addEventListener("touchcancel", handleCancel, false);
//document.addEventListener("touchleave", handleEnd, false);
document.addEventListener("touchmove", function(e: TouchEvent) {
    e.preventDefault();
    var touches = e.changedTouches;
  
    for (var i=0; i < touches.length; i++) {
        var event: MouseEvent = new MouseEvent("onmousemove", {clientX:touches[i].clientX,clientY:touches[i].clientY});
        event.initEvent('mousemove', true, false);
        e.target.dispatchEvent(event);
    }
});

window.onload = function() {
    var map = new HexMap();
    document.getElementById("zoomInButton").addEventListener("click", () => map.zoomIn());
    document.getElementById("zoomOutButton").addEventListener("click", () => map.zoomOut());
    document.getElementById("mapSaveButton").addEventListener("click", () => map.save());
    document.getElementById("mapLoadButton").addEventListener("click", () => map.load());
    
    document.getElementById("upButton").addEventListener("click", () => map.up());
    document.getElementById("downButton").addEventListener("click", () => map.down());
    document.getElementById("leftButton").addEventListener("click", () => map.left());
    document.getElementById("rightButton").addEventListener("click", () => map.right());
    
    map.generateNewDefaultMap();
    map.drawMap();
    
    window.addEventListener('keydown', function(event : KeyboardEvent) {
      switch (event.key) {
        case "q": // Left
          //Game.player.moveLeft();
        break;
    
        case "a": // Up
          //Game.player.moveUp();
        break;
      }
    }, false);
}
//});

