import { Configuration } from './configuration'
import { HexMapTiles } from './hexmaptiles'
import { MapDrawer } from './mapdrawer'
import { CreateMapModal } from './modals/createmapmodal'
import { LoadMapModal } from './modals/loadmapmodal'
import { SaveAsModal } from './modals/saveasmodal'
import { ViewTileModal } from './modals/viewtilemodal'
import { HexTile } from './models/hextile'
import { MapData } from './models/mapdata'
import { MapSettings } from './models/mapsettings'
import { TileColor } from './models/tilecolor'
import { UserSettings } from './models/usersettings'
import { Server } from './server'
import { Tool, ToolSwitcher } from './toolswitcher'

export enum ColumnPosition {
    LEFT,
    RIGHT,
}

export class HexMap {
    private mapData: MapData
    private mapTiles: HexMapTiles
    private userSettings: UserSettings = new UserSettings()

    private canvas = <HTMLCanvasElement>document.getElementById('canvas')

    private mouseHeld: boolean = false
    private previousMouseMove: number[] = []

    private mapName: string

    private configuration: Configuration = new Configuration()
    private mapDrawer: MapDrawer
    private server: Server = new Server()
    private toolSwitcher: ToolSwitcher = new ToolSwitcher(this.configuration)

    constructor() {
        this.userSettings.selectedImage = this.configuration.defaultMapImage
        this.userSettings.selectedColor = this.configuration.defaultMapColor

        this.canvas.addEventListener('click', (e) => this.click(e))
        this.canvas.addEventListener('mousedown', (e) => this.click(e))
        this.canvas.addEventListener('mouseup', (e) => this.click(e))
        this.canvas.addEventListener('mousemove', (e) => this.click(e))
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
        this.generateNewMap(this.configuration.defaultMapSize, this.configuration.defaultMapSize, this.configuration.defaultMapImage, this.configuration.defaultMapColor)
    }

    generateNewMap(width: number, height: number, tileClassName: string, colorClassName: TileColor) {
        let tile = new HexTile()
        tile.image = tileClassName
        tile.color = colorClassName.id
        tile.explored = false
        this.mapData = new MapData(new HexMapTiles(tile, width, height), new MapSettings(), this.configuration.defaultMapColors)
        this.mapTiles = this.mapData.tiles
        this.mapDrawer = new MapDrawer(this.configuration, this.userSettings, this.mapData)
    }

    selectHex(hexName: string, colorName: TileColor) {
        if (hexName != null) {
            this.userSettings.selectedImage = hexName
        }
        if (colorName != null) {
            this.userSettings.selectedColor = colorName
        }
    }

    hexClicked(x: number, y: number) {
        if ([Tool.DRAW_IMAGE_COLOR, Tool.DRAW_COLOR, Tool.DRAW_IMAGE].includes(this.configuration.currentTool)) {
            if (this.userSettings.bigPaint) {
                this.mapTiles.forEachInFOV(x, y, (e) => this.changeTile(e))
            } else {
                let tile = this.mapTiles.get(x, y)
                if (tile !== null) {
                    this.changeTile(tile)
                }
            }
        } else if (this.configuration.currentTool == Tool.EXPLORE) {
            this.mapTiles.forEachInFOV(x, y, (e) => this.explore(e))
        } else if (this.configuration.currentTool == Tool.USE) {
            new ViewTileModal(this.mapTiles.get(x, y) !).createModal()
        }
    }

    changeTile(tile: HexTile) {
        switch (this.configuration.currentTool) {
            case Tool.DRAW_COLOR:
                tile.color = this.userSettings.selectedColor.id
                break
            case Tool.DRAW_IMAGE:
                tile.image = this.userSettings.selectedImage
                break
            case Tool.DRAW_IMAGE_COLOR:
                tile.color = this.userSettings.selectedColor.id
                tile.image = this.userSettings.selectedImage
                break
        }
        this.drawTile(tile)
    }

    explore(tile: HexTile) {
        if (tile != null) {
            tile.explored = true
            this.drawTile(tile)
        }
    }

    async getSavedMapNames(): Promise<string[]> {
        return this.server.getMapNames()
    }

    async create() {
        let modal = new CreateMapModal()
        this.mapName = await modal.waitOnModal()

        this.generateNewMap(this.configuration.defaultMapSize, this.configuration.defaultMapSize, this.configuration.defaultMapImage, this.configuration.defaultMapColor)
        this.deleteMap()
        this.drawMap()
    }

    async load() {
        let modal = new LoadMapModal(await this.getSavedMapNames())
        let mapName = await modal.waitOnModal()

        this.mapData = await this.server.getMap(mapName)
        this.mapTiles = this.mapData.tiles
        this.mapDrawer = new MapDrawer(this.configuration, this.userSettings, this.mapData)

        this.deleteMap()
        this.drawMap()
    }

    async save() {
        let modal = new SaveAsModal()
        let mapName = await modal.waitOnModal()

        if (mapName == null) {
            return
        }
        this.server.putMap(mapName, this.mapData)
    }

    logInOrOut() {
        this.server.logInOrOut()
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
            return
        }
        if (e.buttons == 0 && e.type == 'mousemove') {
            return
        }
        if (e.type == 'mousedown') {
            this.mouseHeld = true
        } else if (e.type == 'mouseup') {
            this.mouseHeld = false
        }
        if (e.type != 'mousemove' || this.mouseHeld == true) {
            if (this.previousMouseMove && Date.now() < this.previousMouseMove[2] + 100) {
                let xHalfPoint = Math.floor((e.clientX + this.previousMouseMove[0]) / 2)
                let yHalfPoint = Math.floor((e.clientY + this.previousMouseMove[1]) / 2)
                let hex: HexTile | null = this.mapDrawer.offsetPixelToHex(xHalfPoint, yHalfPoint)
                if (hex) {
                    this.hexClicked(hex.x, hex.y)
                }
            }
            let hex: HexTile | null = this.mapDrawer.offsetPixelToHex(e.clientX, e.clientY)
            if (hex) {
                this.previousMouseMove = [e.clientX, e.clientY, Date.now()]
                this.hexClicked(hex.x, hex.y)
            }
        }
    }

    setBigPaint(bigPaint: boolean) {
        this.userSettings.bigPaint = bigPaint
    }

    nextSelectedImage(next: boolean) {
        if (next) {
            if (this.userSettings.currentFavoriteImage == this.configuration.favoriteImages.length - 1) {
                this.userSettings.currentFavoriteImage = 0
            } else {
                this.userSettings.currentFavoriteImage++
            }
        } else {
            if (this.userSettings.currentFavoriteImage == 0) {
                this.userSettings.currentFavoriteImage = this.configuration.favoriteImages.length - 1
            } else {
                this.userSettings.currentFavoriteImage--
            }
        }
        this.userSettings.selectedImage = this.configuration.favoriteImages[this.userSettings.currentFavoriteImage]
        this.drawHexSelector()
    }
    nextSelectedColor(next: boolean) {
        let tileColors = this.mapData.tileColors
        let currentSelectedColor = this.userSettings.selectedColor
        if (next) {
            if (currentSelectedColor == tileColors.slice(-1)[0]) {
                this.userSettings.selectedColor = tileColors[0]
            } else {
                this.userSettings.selectedColor = tileColors[tileColors.indexOf(currentSelectedColor) + 1]
            }
        } else {
            if (currentSelectedColor == tileColors[0]) {
                this.userSettings.selectedColor = tileColors.slice(-1)[0]
            } else {
                this.userSettings.selectedColor = tileColors[tileColors.indexOf(currentSelectedColor) - 1]
            }
        }
        this.userSettings.selectedImage = this.configuration.favoriteImages[this.userSettings.currentFavoriteImage]
        this.drawHexSelector()
    }

    drawHexSelector() {
        let selector: HexTile = new HexTile()
        selector.color = this.userSettings.selectedColor.id
        selector.image = this.userSettings.selectedImage
        this.drawTile(selector, true)
    }

    addColumn(right: boolean) {
        let tile = new HexTile()
        tile.image = this.configuration.defaultMapImage
        tile.color = this.configuration.defaultMapColor.id
        tile.explored = false

        this.mapTiles.addColumn(right, tile)
        this.drawMap()
    }

    addRow(bottom: boolean) {
        let tile = new HexTile()
        tile.image = this.configuration.defaultMapImage
        tile.color = this.configuration.defaultMapColor.id
        tile.explored = false

        this.mapTiles.addRow(bottom, tile)
        this.drawMap()
    }

    resize(width: number, height: number, redraw: boolean) {
        this.canvas.width = width
        this.canvas.height = height
        if (redraw) {
            this.drawMap()
        }
    }

    switchToTool(tool: Tool) {
        this.toolSwitcher.switchToTool(tool)
        this.drawMap()
    }
}