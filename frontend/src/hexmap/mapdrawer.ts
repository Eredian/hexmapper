import { ZoomLevel } from './models/zoomlevel';
import { MapData } from './models/mapdata';
import { ZoomLevelImages } from './zoomlevelimages';
import { Mode } from './hexmap';
import { HexMapTiles } from './hexmaptiles';
import { UserSettings } from "./models/usersettings";
import { HexTile } from "./models/hextile";
import { Configuration } from './configuration';

export class MapDrawer {
    private hexSideLength: number;
    private hexHeight: number;
    private baseXPos: number = 0;
    private baseYPos: number = 0;

    private zoomLevel: number = 1;
    private configuration: Configuration
    private userSettings: UserSettings
    private mapTiles: HexMapTiles;
    private zoomLevelImages: ZoomLevelImages[] = []

    private canvas = <HTMLCanvasElement>document.getElementById("canvas");
    private context = <CanvasRenderingContext2D>this.canvas.getContext("2d");
    private baseImages: { [key: string]: HTMLImageElement };

    constructor(configuration: Configuration, userSettings: UserSettings, mapData: MapData) {
        this.configuration = configuration
        this.userSettings = userSettings;
        this.mapTiles = mapData.tiles

        this.configuration.zoomLevelMap.forEach((zoomLevel: ZoomLevel) => {
            this.zoomLevelImages.push(new ZoomLevelImages(zoomLevel, mapData.tileColors))
        })

        this.updateHexDimensions();
        this.loadImages();
    }

    private loadImages() {
        let xmlhttp = new XMLHttpRequest();
        let url = "img/images/list.json";
        this.baseImages = {};
        let parent = this;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                let imageNames: [string] = JSON.parse(xmlhttp.responseText);
                imageNames.forEach(function (element) {
                    let baseImage = new Image();
                    baseImage.src = "img/images/" + element;
                    parent.baseImages[element.substr(0, element.length - 4)] = baseImage;
                }, parent);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    private updateHexDimensions() {
        this.hexSideLength = 35;
        this.hexHeight = 2 * this.hexSideLength;
    }

    zoomIn() {
        if (!this.configuration.zoomLevelMap[this.zoomLevel + 1]) {
            return;
        }
        this.baseXPos *= Math.floor(this.configuration.zoomLevelMap[this.zoomLevel + 1].halfWidth / this.configuration.zoomLevelMap[this.zoomLevel].halfWidth);
        this.baseYPos *= Math.floor(this.configuration.zoomLevelMap[this.zoomLevel + 1].halfHeight / this.configuration.zoomLevelMap[this.zoomLevel].halfHeight);
        this.zoomLevel++;
        this.updateHexDimensions();
        this.deleteMap();
        this.drawMap();
    }

    zoomOut() {
        if (!this.configuration.zoomLevelMap[this.zoomLevel - 1]) {
            return;
        }
        this.baseXPos *= Math.floor(this.configuration.zoomLevelMap[this.zoomLevel - 1].halfWidth / this.configuration.zoomLevelMap[this.zoomLevel].halfWidth);
        this.baseYPos *= Math.floor(this.configuration.zoomLevelMap[this.zoomLevel - 1].halfHeight / this.configuration.zoomLevelMap[this.zoomLevel].halfHeight);
        this.zoomLevel--;
        this.updateHexDimensions();
        this.deleteMap();
        this.drawMap();
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
        let bottomRightTile: HexTile = this.mapTiles.getBottomRightTile();
        let topLeftTile: HexTile = this.mapTiles.getTopLeftTile();

        let leftEdgeOffset: number = this.hex_to_pixel(topLeftTile).x;
        let rightEdgeOffset: number = this.hex_to_pixel(bottomRightTile).x + this.currentZoomLevel().width;
        let topEdgeOffset: number = this.hex_to_pixel(topLeftTile).y;
        let bottomEdgeOffset: number = this.hex_to_pixel(bottomRightTile).y + this.currentZoomLevel().height;

        let totalWidth = rightEdgeOffset - leftEdgeOffset;
        let totalHeight = bottomEdgeOffset - topEdgeOffset;

        if (this.canvas.width > totalWidth) {
            this.baseXPos = Math.floor((totalWidth - this.canvas.width) / 2) + leftEdgeOffset
        } else if (this.baseXPos > rightEdgeOffset - this.canvas.width) {
            this.baseXPos = rightEdgeOffset - this.canvas.width;
        } else if (this.baseXPos < leftEdgeOffset) {
            this.baseXPos = leftEdgeOffset;
        }
        if (this.canvas.height > totalHeight) {
            this.baseYPos = Math.floor((totalHeight - this.canvas.height) / 2) + topEdgeOffset
        } else if (this.baseYPos > bottomEdgeOffset - this.canvas.height) {
            this.baseYPos = bottomEdgeOffset - this.canvas.height;
        } else if (this.baseYPos < topEdgeOffset) {
            this.baseYPos = topEdgeOffset;
        }
    }

    drawTile(tile: HexTile, selector: boolean = false) {
        let explored = tile["explored"] || this.configuration.mode == Mode.EDIT;

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
            this.context.drawImage(this.currentZoomLevel().colorMap[0], XPos, YPos);
        }

        if (this.currentZoomLevel().width > 20) {
            this.context.drawImage(this.currentZoomLevel().borderColorMap[Math.abs((tile.x ? tile.x : 0) % 7)], XPos, YPos);
        }

        if (tile.image != "nothing" && tile.image != "" && this.currentZoomLevel().width > 20 && explored) {
            let baseImage = this.baseImages[tile.image];
            this.context.drawImage(baseImage, XPos - (baseImage.width - this.currentZoomLevel().width) / 2, YPos - (baseImage.height - this.currentZoomLevel().height) / 2);
        }
        if (this.userSettings.drawHexNumbers) {
            this.context.lineWidth = 1;
            this.context.textAlign = "center";
            this.context.font = "12px Verdana";
            this.context.fillStyle = 'black';
            this.context.strokeStyle = 'black';
            this.context.fillText(tile.x + ', ' + tile.y, XPos + this.currentZoomLevel().width / 2, YPos + this.currentZoomLevel().height / 2);
        }
    }

    drawHexSelector() {
        let selector: HexTile = new HexTile();
        selector.color = this.userSettings.selectedColor.id;
        selector.image = this.userSettings.selectedImage;
        this.drawTile(selector, true);
    }

    currentZoomLevel(): ZoomLevelImages {
        return this.zoomLevelImages[this.zoomLevel];
    }

    changeMapPosition(x: number, y: number) {
        this.baseXPos += x;
        this.baseYPos += y;
        this.deleteMap();
        this.drawMap();
    }

    private pixel_to_hex(x: number, y: number) {
        x -= this.currentZoomLevel().width / 2;
        y -= this.currentZoomLevel().height / 2;
        let r = y / this.currentZoomLevel().zoomLevel.halfHeight;
        let q = (x - r * this.currentZoomLevel().zoomLevel.halfWidth) / this.currentZoomLevel().width;
        let hexPosition = this.hex_round(q, r);
        return this.mapTiles.get(hexPosition[0], hexPosition[1]);
    }

    private hex_to_pixel(tile: HexTile) {
        let x = this.currentZoomLevel().width * tile.x + tile.y * this.currentZoomLevel().zoomLevel.halfWidth;
        let y = this.currentZoomLevel().zoomLevel.halfHeight * tile.y;
        return { "x": Math.floor(x), "y": Math.floor(y) };
    }

    private hex_round(q: number, r: number) {
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

    offsetPixelToHex(x: number, y: number): HexTile | null {
        return this.pixel_to_hex(x + this.baseXPos, y + this.baseYPos);
    }
}