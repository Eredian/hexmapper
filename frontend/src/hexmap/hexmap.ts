import { UserSettings } from "./models/usersettings";
import { MapDrawer } from './mapdrawer';
import { Configuration } from './configuration';
import { SaveAsModal } from "./modals/saveasmodal";
import { LoadMapModal } from "./modals/loadmapmodal";
import { CreateMapModal } from "./modals/createmapmodal";
import { HexTile } from "./models/hextile";
import { HexMapTiles } from './hexmaptiles';
import { TileColor } from "./enums/tilecolor";

export enum ColumnPosition {
    LEFT,
    RIGHT,
}

export enum Mode {
    EDIT,
    EXPLORE
}

export class HexMap {
    mapTiles: HexMapTiles = new HexMapTiles();
    userSettings: UserSettings = new UserSettings()

    canvas = <HTMLCanvasElement>document.getElementById("canvas");
    context = <CanvasRenderingContext2D>this.canvas.getContext("2d");

    mouseHeld: boolean = false;
    previousMouseMove: number[] = [];

    mapName: string;

    backEndPath: string = "http://localhost:8081/"

    configuration: Configuration = new Configuration()
    mapDrawer: MapDrawer

    constructor() {
        this.mapDrawer = new MapDrawer(this.configuration, this.userSettings, this.mapTiles)

        this.userSettings.selectedImage = this.configuration.defaultMapImage
        this.userSettings.selectedColor = this.configuration.defaultMapColor

        this.canvas.addEventListener("click", (e) => this.click(e));
        this.canvas.addEventListener("mousedown", (e) => this.click(e));
        this.canvas.addEventListener("mouseup", (e) => this.click(e));
        this.canvas.addEventListener("mousemove", (e) => this.click(e));
    }

    zoomIn() {
        this.mapDrawer.zoomIn()
    }

    zoomOut() {
        this.mapDrawer.zoomOut()
    }

    deleteMap() {
        this.mapDrawer.deleteMap()
    }

    drawMap() {
        this.mapDrawer.drawMap()
    }

    repositionMap() {
        this.mapDrawer.repositionMap()
    }

    drawTile(tile: HexTile, selector: boolean = false) {
        this.mapDrawer.drawTile(tile, selector)
    }

    generateNewDefaultMap() {
        this.generateNewMap(this.configuration.defaultMapSize, this.configuration.defaultMapSize, this.configuration.defaultMapImage, this.configuration.defaultMapColor);
    }

    generateNewMap(width: number, height: number, tileClassName: string, colorClassName: TileColor) {
        this.mapTiles.clear();
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
            this.userSettings.selectedImage = hexName;
        }
        if (colorName != null) {
            this.userSettings.selectedColor = colorName;
        }
    }

    hexClicked(x: number, y: number) {
        if (this.configuration.mode == Mode.EDIT) {
            if (this.userSettings.bigPaint) {
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
        tile.image = this.userSettings.selectedImage;
        tile.color = this.userSettings.selectedColor;
        this.drawTile(tile);
    }

    explore(tile: HexTile) {
        if (tile != null) {
            tile.explored = true;
            this.drawTile(tile);
        }
    }

    async getSavedMapNames(): Promise<string[]> {
        let response = await fetch(this.backEndPath);
        let mapNames: string[] = JSON.parse(await response.text());
        return mapNames;
    }

    async create() {
        let modal = new CreateMapModal();
        this.mapName = await modal.waitOnModal();

        this.generateNewMap(this.configuration.defaultMapSize, this.configuration.defaultMapSize, this.configuration.defaultMapImage, this.configuration.defaultMapColor);
        this.deleteMap();
        this.drawMap();
    }

    async load() {
        let modal = new LoadMapModal(await this.getSavedMapNames());
        let mapName = await modal.waitOnModal();

        let url = this.backEndPath + mapName;
        let mapResponse = await fetch(url);
        let json = await mapResponse.text();

        this.mapTiles.import(json);
        this.deleteMap();
        this.drawMap();
    }

    async save() {
        let modal = new SaveAsModal();
        let mapName = await modal.waitOnModal();

        if (mapName == null) {
            return;
        }
        let url = this.backEndPath + mapName;

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: this.mapTiles.export()
        });

        alert(response);
    }

    up() {
        this.mapDrawer.changeMapPosition(0, -374)
    }

    down() {
        this.mapDrawer.changeMapPosition(0, 374)
    }

    left() {
        this.mapDrawer.changeMapPosition(-512, 0)
    }

    right() {
        this.mapDrawer.changeMapPosition(512, 0)
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
                let xHalfPoint = Math.floor((e.clientX + this.previousMouseMove[0]) / 2);
                let yHalfPoint = Math.floor((e.clientY + this.previousMouseMove[1]) / 2);
                let hex: HexTile | null = this.mapDrawer.offsetPixelToHex(xHalfPoint, yHalfPoint);
                if (hex) {
                    this.hexClicked(hex.x, hex.y);
                }
            }
            let hex: HexTile | null = this.mapDrawer.offsetPixelToHex(e.clientX, e.clientY);
            if (hex) {
                this.previousMouseMove = [e.clientX, e.clientY, Date.now()];
                this.hexClicked(hex.x, hex.y);
            }
        }
    }

    setBigPaint(bigPaint: boolean) {
        this.userSettings.bigPaint = bigPaint;
    }

    nextSelectedImage(next: boolean) {
        if (next) {
            if (this.userSettings.currentFavoriteImage == this.configuration.favoriteImages.length - 1) {
                this.userSettings.currentFavoriteImage = 0;
            } else {
                this.userSettings.currentFavoriteImage++;
            }
        } else {
            if (this.userSettings.currentFavoriteImage == 0) {
                this.userSettings.currentFavoriteImage = this.configuration.favoriteImages.length - 1;
            } else {
                this.userSettings.currentFavoriteImage--;
            }
        }
        this.userSettings.selectedImage = this.configuration.favoriteImages[this.userSettings.currentFavoriteImage];
        this.drawHexSelector();
    }
    nextSelectedColor(next: boolean) {
        if (next) {
            if (this.userSettings.selectedColor == TileColor.NOTHING) {
                this.userSettings.selectedColor = 0;
            } else {
                this.userSettings.selectedColor++;
            }
        } else {
            if (this.userSettings.selectedColor == 0) {
                this.userSettings.selectedColor = 4;
            } else {
                this.userSettings.selectedColor--;
            }
        }
        this.userSettings.selectedImage = this.configuration.favoriteImages[this.userSettings.currentFavoriteImage];
        this.drawHexSelector();
    }

    drawHexSelector() {
        let selector: HexTile = new HexTile();
        selector.color = this.userSettings.selectedColor;
        selector.image = this.userSettings.selectedImage;
        this.drawTile(selector, true);
    }

    addColumn(right: boolean) {
        this.mapTiles.addColumn(right);
        this.drawMap();
    }

    addRow(bottom: boolean) {
        this.mapTiles.addRow(bottom);
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