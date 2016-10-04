import { HexTile } from "./hextile";
import { HexMapTiles } from "./hexmaptiles";
import { TileColor } from "./tilecolor";
import { ZoomLevel } from "./zoomlevel";
import { utils } from "../utils/urlobject";

export enum ColumnPosition {
    LEFT,
    RIGHT,
}

export enum Mode {
    EDIT,
    EXPLORE
}

export class HexMap {

    hexSideLength: number;
    hexHeight: number;
    baseXPos: number = 0;
    baseYPos: number = 0;

    selectedImage: string;
    defaultMapSize: number = 50;
    zoomLevel: number = 1;
    defaultMapColor: TileColor = TileColor.CAVERN_GROUND;
    selectedColor: TileColor = this.defaultMapColor;
    defaultMapImage: string;
    mode: Mode = Mode.EXPLORE;
    mapTiles: HexMapTiles = new HexMapTiles();
    zoomLevelMap: { [key: number]: ZoomLevel } = {};

    url = utils.urlObject({});

    baseImages: { [key: string]: HTMLImageElement };
    canvas = <HTMLCanvasElement>document.getElementById("canvas");
    context = <CanvasRenderingContext2D>this.canvas.getContext("2d");

    mouseHeld: boolean = false;
    previousMouseMove: number[] = [];
    bigPaint: boolean = false;
    drawHexNumbers: boolean = false;
    favoriteImages: string[] = [];
    currentFavoriteImage: number = 0;

    constructor() {/*
        this.zoomLevelMap[0] = [6, 1];
        this.zoomLevelMap[1] = [35, 3];
        this.zoomLevelMap[2] = [80, 5];*/

        this.zoomLevelMap[0] = new ZoomLevel(7, 11, "zoomlevel0");
        this.zoomLevelMap[1] = new ZoomLevel(30, 53, "zoomlevel1");
        this.zoomLevelMap[2] = new ZoomLevel(70, 121, "zoomlevel2");



        this.favoriteImages.push("nothing");
        this.favoriteImages.push("stalagmites");
        this.favoriteImages.push("fungalforest");
        this.favoriteImages.push("fungalforestheavy");
        this.favoriteImages.push("battle");
        this.favoriteImages.push("battleprimitive");
        this.favoriteImages.push("bridge");
        this.favoriteImages.push("camp");
        this.favoriteImages.push("castle");
        this.favoriteImages.push("cathedral");
        this.favoriteImages.push("cave");
        this.favoriteImages.push("church");
        this.favoriteImages.push("city");
        this.favoriteImages.push("crater");
        this.favoriteImages.push("crossbones");
        this.favoriteImages.push("cultivatedfarmland");
        this.favoriteImages.push("dragon");
        this.favoriteImages.push("dungeon");
        this.favoriteImages.push("fort");
        this.favoriteImages.push("mines");
        this.favoriteImages.push("monolith");
        this.favoriteImages.push("monsterlair");
        this.favoriteImages.push("pointofinterest");
        this.favoriteImages.push("shrubland");
        this.favoriteImages.push("skullcrossbones");
        this.favoriteImages.push("tower");
        this.favoriteImages.push("waystation");

        this.defaultMapImage = this.favoriteImages[this.currentFavoriteImage];
        this.selectedImage = this.defaultMapImage;

        if (this.url["parameters"]["mode"] == "edit") {
            this.mode = Mode.EDIT;
        } else {
            this.mode = Mode.EXPLORE;
        }

        this.updateHexDimensions();

        this.loadImages();

        this.canvas.addEventListener("click", (e) => this.click(e));
        this.canvas.addEventListener("mousedown", (e) => this.click(e));
        this.canvas.addEventListener("mouseup", (e) => this.click(e));
        this.canvas.addEventListener("mousemove", (e) => this.click(e));
    }

    updateHexDimensions() {
        this.hexSideLength = 35;
        this.hexHeight = 2 * this.hexSideLength;
    }

    zoomIn() {
        if (!this.zoomLevelMap[this.zoomLevel + 1]) {
            return;
        }
        this.baseXPos *= Math.floor(this.zoomLevelMap[this.zoomLevel + 1].halfWidth / this.zoomLevelMap[this.zoomLevel].halfWidth);
        this.baseYPos *= Math.floor(this.zoomLevelMap[this.zoomLevel + 1].halfHeight / this.zoomLevelMap[this.zoomLevel].halfHeight);
        this.zoomLevel++;
        this.updateHexDimensions();
        this.deleteMap();
        this.drawMap();
    }

    zoomOut() {
        if (!this.zoomLevelMap[this.zoomLevel - 1]) {
            return;
        }
        this.baseXPos *= Math.floor(this.zoomLevelMap[this.zoomLevel - 1].halfWidth / this.zoomLevelMap[this.zoomLevel].halfWidth);
        this.baseYPos *= Math.floor(this.zoomLevelMap[this.zoomLevel - 1].halfHeight / this.zoomLevelMap[this.zoomLevel].halfHeight);
        this.zoomLevel--;
        this.updateHexDimensions();
        this.deleteMap();
        this.drawMap();
    }

    currentZoomLevel() {
        return this.zoomLevelMap[this.zoomLevel];
    }

    loadImages() {
        let xmlhttp = new XMLHttpRequest();
        let url = "getimagenames.php";
        this.baseImages = {};
        let parent = this;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                let imageNames: [string] = JSON.parse(xmlhttp.responseText);
                imageNames.forEach(function (element) {
                    let baseImage = new Image();
                    baseImage.src = "images/" + element;
                    parent.baseImages[element.substr(0, element.length - 4)] = baseImage;
                }, parent);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    deleteMap() {
        let canvas = <HTMLCanvasElement>document.getElementById("canvas");
        let context = <CanvasRenderingContext2D>canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    }



    drawMap() {
        if (!this.currentZoomLevel().ready) {
            setTimeout(() => { this.drawMap(); }, 10);
            return;
        }
        this.repositionMap();
        this.mapTiles.forEach((x) => x != null ? this.drawTile(x) : null);
    }

    repositionMap() {
        let bottomRightTile: HexTile | null = this.mapTiles.getBottomRightTile();
        if (bottomRightTile === null) {
            throw new Error("Cannot reposition map, maybe it isn't created yet.");
        }
        let totalWidth = this.currentZoomLevel().width * this.mapTiles.getWidth() + this.currentZoomLevel().halfWidth;
        let totalHeight = this.currentZoomLevel().halfHeight * bottomRightTile.y + this.currentZoomLevel().height;

        if (this.canvas.width > totalWidth) {
            this.baseXPos = Math.floor((totalWidth - this.canvas.width) / 2)
        } else if (this.baseXPos > totalWidth - this.canvas.width) {
            this.baseXPos = totalWidth - this.canvas.width;
        } else if (this.baseXPos < 0) {
            this.baseXPos = 0;
        }
        if (this.canvas.height > totalHeight) {
            this.baseYPos = Math.floor((totalHeight - this.canvas.height) / 2)
        } else if (this.baseYPos > totalHeight - this.canvas.height) {
            this.baseYPos = totalHeight - this.canvas.height;
        } else if (this.baseYPos < 0) {
            this.baseYPos = 0;
        }
    }

    drawTile(tile: HexTile, selector: boolean = false) {
        let explored = tile["explored"] || this.mode == Mode.EDIT;

        let XPos = selector ? 15 : this.hex_to_pixel(tile).x - this.baseXPos;
        let YPos = selector ? 15 : this.hex_to_pixel(tile).y - this.baseYPos;

        if (XPos + this.currentZoomLevel().width < 0 || YPos + this.hexHeight < 0) {
            return;
        }
        if (XPos - this.currentZoomLevel().width > this.canvas.width || YPos - this.hexHeight > this.canvas.height) {
            return;
        }
        if (explored) {
            this.context.drawImage(this.currentZoomLevel().colorMap[tile.color], XPos, YPos);
        } else {
            this.context.drawImage(this.currentZoomLevel().colorMap[TileColor.UNEXPLORED], XPos, YPos);
        }

        if (this.currentZoomLevel().width > 20) {
            this.context.drawImage(this.currentZoomLevel().borderColorMap[Math.abs((tile.x ? tile.x : 0) % 7)], XPos, YPos);
        }

        if (tile.image != "nothing" && tile.image != "" && this.currentZoomLevel().width > 20 && explored) {
            let baseImage = this.baseImages[tile.image];
            this.context.drawImage(baseImage, XPos - (baseImage.width - this.currentZoomLevel().width) / 2, YPos - (baseImage.height - this.currentZoomLevel().height) / 2);
        }
        if (this.drawHexNumbers) {
            this.context.lineWidth = 1;
            this.context.textAlign = "center";
            this.context.font = "12px Verdana";
            this.context.fillStyle = 'black';
            this.context.strokeStyle = 'black';
            this.context.fillText(tile.x + ', ' + tile.y, XPos + this.currentZoomLevel().width / 2, YPos + this.currentZoomLevel().height / 2);
        }
    }
    /*
        addColumn(position : ColumnPosition) {
            for (var row = 0; row < this.mapTiles.length; row++) {
                let cell = {};
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
        this.generateNewMap(this.defaultMapSize, this.defaultMapSize, this.defaultMapImage, this.defaultMapColor);
    }

    generateNewMap(width: number, height: number, tileClassName: string, colorClassName: TileColor) {
        this.mapTiles = new HexMapTiles();
        for (var column = 0; column < width; column++) {
            let x = column;
            let y = 0;

            for (var row = 0; row < height; row++) {


                let tile = new HexTile();
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

    selectHex(hexName: string, colorName: TileColor) {
        if (hexName != null) {
            this.selectedImage = hexName;
        }
        if (colorName != null) {
            this.selectedColor = colorName;
        }
    }


    hexClicked(x: number, y: number) {
        if (this.mode == Mode.EDIT) {
            if (this.bigPaint) {
                this.mapTiles.forEachInFOV(x, y, (e) => this.changeTile(e));
            } else {
                let tile = this.mapTiles.get(x, y);
                if (tile !== null) {
                    this.changeTile(tile);
                }
            }
        } else {
            this.mapTiles.forEachInFOV(x, y, (e) => this.explore(e));
        }
    }

    changeTile(tile: HexTile) {
        tile.image = this.selectedImage;
        tile.color = this.selectedColor;
        this.drawTile(tile);
    }

    explore(tile: HexTile) {
        if (tile != null) {
            tile.explored = true;
            this.drawTile(tile);
        }
    }

    load() {
        let mapName: string | null = prompt("Enter map name.");
        if (mapName == null) {
            return;
        }
        this.loadImages();
        let xmlhttp = new XMLHttpRequest();
        let url = "load.php?filename=" + mapName;

        let parent = this;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                parent.mapTiles.setTiles(JSON.parse(xmlhttp.responseText));
                parent.deleteMap();
                parent.drawMap();
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    save() {
        let mapName: string | null = prompt("Enter map name.");
        if (mapName == null) {
            return;
        }
        let xmlhttp = new XMLHttpRequest();
        let url = "save.php?filename=" + mapName;

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                alert(xmlhttp.responseText);
            }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send("data=" + JSON.stringify(this.mapTiles.tiles));
    }

    up() {
        this.baseYPos -= 374;
        this.deleteMap();
        this.drawMap();
    }

    down() {
        this.baseYPos += 374;
        this.deleteMap();
        this.drawMap();
    }

    left() {
        this.baseXPos -= 512;
        this.deleteMap();
        this.drawMap();
    }

    right() {
        this.baseXPos += 512;
        this.deleteMap();
        this.drawMap();
    }

    pixel_to_hex(x: number, y: number) {
        x -= this.currentZoomLevel().width / 2;
        y -= this.currentZoomLevel().height / 2;
        let r = y / this.currentZoomLevel().halfHeight;
        let q = (x - r * this.currentZoomLevel().halfWidth) / this.currentZoomLevel().width;
        let hexPosition = this.hex_round(q, r);
        return this.mapTiles.get(hexPosition[0], hexPosition[1]);
    }

    hex_to_pixel(tile: HexTile) {
        let x = this.currentZoomLevel().width * tile.x + tile.y * this.currentZoomLevel().halfWidth;
        let y = this.currentZoomLevel().halfHeight * tile.y;
        return { "x": Math.floor(x), "y": Math.floor(y) };
    }

    hex_round(q: number, r: number) {
        let x: number = q;
        let z: number = r;
        let y: number = -x - z;

        let rx: number = Math.round(x);
        let ry: number = Math.round(y);
        let rz: number = Math.round(z);

        let x_diff: number = Math.abs(rx - x);
        let y_diff: number = Math.abs(ry - y);
        let z_diff: number = Math.abs(rz - z);

        if (x_diff > y_diff && x_diff > z_diff) {
            rx = -ry - rz;
        } else if (y_diff > z_diff) {
            ry = -rx - rz;
        } else {
            rz = -rx - ry;
        }
        return [rx, rz];
    }

    click(e: MouseEvent) {
        if (e.button != 0) {
            return;
        }
        if (e.buttons == 0 && e.type == "mousemove") {
            return;
        }
        if (e.type == "mousedown") {
            this.mouseHeld = true;
        } else if (e.type == "mouseup") {
            this.mouseHeld = false;
        }
        if (e.type != "mousemove" || this.mouseHeld == true) {
            if (this.previousMouseMove && Date.now() < this.previousMouseMove[2] + 100) {
                let xHalfPoint = Math.floor((e.clientX + this.previousMouseMove[0]) / 2) + this.baseXPos;
                let yHalfPoint = Math.floor((e.clientY + this.previousMouseMove[1]) / 2) + this.baseYPos;
                let hex: HexTile | null = this.pixel_to_hex(xHalfPoint, yHalfPoint);
                if (hex) {
                    this.hexClicked(hex.x, hex.y);
                }
            }
            let hex: HexTile | null = this.pixel_to_hex(e.clientX + this.baseXPos, e.clientY + this.baseYPos);
            if (hex) {
                this.previousMouseMove = [e.clientX, e.clientY, Date.now()];
                this.hexClicked(hex.x, hex.y);
            }
        }
    }

    setBigPaint(bigPaint: boolean) {
        this.bigPaint = bigPaint;
    }
    nextSelectedImage(next: boolean) {
        if (next) {
            if (this.currentFavoriteImage == this.favoriteImages.length - 1) {
                this.currentFavoriteImage = 0;
            } else {
                this.currentFavoriteImage++;
            }
        } else {
            if (this.currentFavoriteImage == 0) {
                this.currentFavoriteImage = this.favoriteImages.length - 1;
            } else {
                this.currentFavoriteImage--;
            }
        }
        this.selectedImage = this.favoriteImages[this.currentFavoriteImage];
        this.drawHexSelector();
    }
    nextSelectedColor(next: boolean) {
        if (next) {
            if (this.selectedColor == TileColor.NOTHING) {
                this.selectedColor = 0;
            } else {
                this.selectedColor++;
            }
        } else {
            if (this.selectedColor == 0) {
                this.selectedColor = 4;
            } else {
                this.selectedColor--;
            }
        }
        this.selectedImage = this.favoriteImages[this.currentFavoriteImage];
        this.drawHexSelector();
    }

    drawHexSelector() {
        let selector: HexTile = new HexTile();
        selector.color = this.selectedColor;
        selector.image = this.selectedImage;
        this.drawTile(selector, true);
    }

    addColumn(right: boolean) {
        this.mapTiles.addRow(right);
        this.drawMap();
    }

    resize(width: number, height: number, redraw: boolean) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (redraw) {
            this.drawMap();
        }
    }
}