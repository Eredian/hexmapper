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
    } else {
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
            } else {
                key = get_param[0];
                val = get_param[1];
            }

            if (options.convert_num) {
                if (val.match(/^\d+$/)) {
                    val = parseInt(val, 10);
                } else if (val.match(/^\d+\.\d+$/)) {
                    val = parseFloat(val);
                }
            }

            if (url_get_params[key] === undefined) {
                url_get_params[key] = val;
            } else if (typeof url_get_params[key] === "string") {
                url_get_params[key] = [url_get_params[key], val];
            } else {
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

    hexSideLength : number = 4;
    hexWidth : number = Math.round(Math.sqrt(3) * this.hexSideLength);
    hexHeight : number = 2 * this.hexSideLength;
    selectedHex : string = "";
    defaultMapSize : number = 50;
    defaultMapColor : TileColor = TileColor.CAVERN_GROUND;
    selectedColor : TileColor = this.defaultMapColor;
    defaultMapTile : string = "nothing";
    mode : Mode = Mode.EXPLORE;
    mapTiles : HexMapTiles = new HexMapTiles();
    colorMap: { [key: number]: string}  = {};
    
    
               
    canvas = <HTMLCanvasElement> document.getElementById("canvas");
    context = <CanvasRenderingContext2D> this.canvas.getContext("2d");

    constructor() {
        this.colorMap[TileColor.CAVERN_GROUND] = "#B4B4B4";
        this.colorMap[TileColor.NOTHING] = "#000000";
        this.colorMap[TileColor.MURKY_WATER] = "#1919AA";
        this.colorMap[TileColor.SWAMP_RIVER] = "#2D4BC8";
        this.colorMap[TileColor.LAVA] = "#FF3714";
        
        if (url["parameters"]["mode"] == "edit") {
            this.mode = Mode.EDIT;
        } else {
            this.mode = Mode.EXPLORE;
        }
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
        //stringOutput += '<div class="hexcell '+this.explored+'" id="' + tile["x"] + ',' + tile["y"] + 'explorationlayer" ></div>';
        //stringOutput += '<div id="' + tile["x"] + ',' + tile["y"] + '" class="hexcell display ' + tile["tile"] + ' ' + tile["color"] + '" onmousemove="map.hexHovered(this.id)" onClick="map.hexClicked(this.id)">';
        var baseXPos = this.hexWidth/2+3;
        var baseYPos = this.hexHeight/2+3;
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
        var xmlhttp = new XMLHttpRequest();
        var url = "load.php?filename=" + (<HTMLTextAreaElement>document.getElementById("mapData")).value;
    
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
    }

    save() {
        var xmlhttp = new XMLHttpRequest();
        var url = "save.php?filename=" + (<HTMLTextAreaElement>document.getElementById("mapData")).value;
    
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                alert(xmlhttp.responseText);
            }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send("data=" + JSON.stringify(this.mapTiles.tiles));
    }

}

class HexMapTiles {
    // First key is x and second key y
    tiles: { [key: number]: { [key: number]: HexTile} };

    constructor() {
        this.tiles = {};
    }

    add(x: number, y: number, value: HexTile): void {
        if(this.tiles[x] == null) {
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
        if(this.tiles[x] != null) {
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
        var tiles: [HexTile] = [this.get(x,y), this.get(x+1,y), this.get(x,y+1), this.get(x-1,y), this.get(x,y-1), this.get(x+1,y-1), this.get(x-1,y+1)];
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

document.ontouchmove = function(event){
    event.preventDefault();
};

window.onload = function () {
    url = urlObject({});
    var map = new HexMap();

    map.generateNewDefaultMap();
    map.drawMap();
    document.getElementById("mapSaveButton").addEventListener("click", () => map.save());
    document.getElementById("mapLoadButton").addEventListener("click", () => map.load());
};

