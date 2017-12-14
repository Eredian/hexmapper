import { configuration } from './configuration'
import { Tool } from './enums/tool'
import { HexMapTiles } from './hexmaptiles'
import { OperateOnTile } from './interfaces/operateontile'
import { MapDrawer } from './mapdrawer'
import { CreateMapModal } from './modals/createmapmodal'
import { LoadMapModal } from './modals/loadmapmodal'
import { PermissionsModal } from './modals/permissionsmodal'
import { SaveAsModal } from './modals/saveasmodal'
import { ViewTileModal } from './modals/viewtilemodal'
import { HexTile } from './models/hextile'
import { MapData } from './models/mapdata'
import { MapPermissions } from './models/mappermissions'
import { MapSettings } from './models/mapsettings'
import { TileColor } from './models/tilecolor'
import { UserSettings } from './models/usersettings'
import { currentUser, Server } from './server'
import { ToolSwitcher } from './toolswitcher'

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

    private mapDrawer: MapDrawer
    private server: Server = new Server()
    private toolSwitcher: ToolSwitcher = new ToolSwitcher()

    constructor() {
        this.userSettings.selectedImage = configuration.defaultMapImage
        this.userSettings.selectedColor = configuration.defaultMapColor

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

    generateNewDefaultMap() {
        this.generateNewMap(configuration.defaultMapSize, configuration.defaultMapSize, configuration.defaultMapImage, configuration.defaultMapColor)
    }

    generateNewMap(width: number, height: number, tileClassName: string, colorClassName: TileColor) {
        let tile = new HexTile()
        tile.image = tileClassName
        tile.color = colorClassName
        tile.explored = false
        this.mapData = new MapData(new HexMapTiles(tile, width, height), new MapSettings(), configuration.defaultMapColors, new MapPermissions(currentUser))
        this.mapTiles = this.mapData.tiles
        this.mapDrawer = new MapDrawer(this.mapData)
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
        if ([Tool.DRAW_IMAGE_COLOR, Tool.DRAW_COLOR, Tool.DRAW_IMAGE].includes(configuration.currentTool)) {
            this.clickTilesAccordingToPaint(x, y, (e) => this.changeTile(e))
        } else if (configuration.currentTool == Tool.EXPLORE) {
            if (this.toolSwitcher.currentlyExploring) {
                this.clickTilesAccordingToPaint(x, y, (e) => this.explore(e))
            } else if (this.toolSwitcher.currentlyConcealing) {
                this.clickTilesAccordingToPaint(x, y, (e) => this.conceal(e))
            } else if (this.mapTiles.get(x, y)!.explored) {
                this.toolSwitcher.currentlyConcealing = true
                this.clickTilesAccordingToPaint(x, y, (e) => this.conceal(e))
            } else {
                this.toolSwitcher.currentlyExploring = true
                this.clickTilesAccordingToPaint(x, y, (e) => this.explore(e))
            }
        } else if (configuration.currentTool == Tool.USE) {
            let tile = this.mapTiles.get(x, y)!
            if (tile.explored || this.canEdit()) {
                try {
                    new ViewTileModal(tile, this.mapDrawer, this.canEdit()).createModal()
                } catch (e) { }
            }
        } else if (configuration.currentTool == Tool.EYEDROPPER) {
            let tile = this.mapTiles.get(x, y)!
            this.userSettings.selectedColor = tile.color
            this.userSettings.selectedImage = tile.image
            this.switchToTool(Tool.DRAW_IMAGE_COLOR)
        }
    }

    private clickTilesAccordingToPaint(x: number, y: number, func: OperateOnTile) {
        let tile = this.mapTiles.get(x, y)
        if (tile != null && !this.userSettings.bigPaint) {
            func(tile)
        } else if (this.userSettings.bigPaint) {
            this.mapTiles.forEachInFOV(x, y, func)
        }
    }

    private canEdit() {
        return this.mapData.permissions.canEdit(currentUser)
    }

    changeTile(tile: HexTile) {
        switch (configuration.currentTool) {
            case Tool.DRAW_COLOR:
                tile.color = this.userSettings.selectedColor
                break
            case Tool.DRAW_IMAGE:
                tile.image = this.userSettings.selectedImage
                break
            case Tool.DRAW_IMAGE_COLOR:
                tile.color = this.userSettings.selectedColor
                tile.image = this.userSettings.selectedImage
                break
        }
        this.mapDrawer.drawTile(tile)
    }

    explore(tile: HexTile) {
        if (tile != null) {
            tile.explored = true
            this.mapDrawer.drawTile(tile)
        }
    }

    conceal(tile: HexTile) {
        if (tile != null) {
            tile.explored = false
            this.mapDrawer.drawTile(tile)
        }
    }

    async getSavedMapNames(): Promise<string[]> {
        return this.server.getMapNames()
    }

    async create() {
        try {
            let modal = new CreateMapModal()
            this.mapName = await modal.waitOnModal()

            this.generateNewMap(configuration.defaultMapSize, configuration.defaultMapSize, configuration.defaultMapImage, configuration.defaultMapColor)
            this.deleteMap()
            this.drawMap()
        } catch (e) { }
    }

    async load() {
        try {
            let modal = new LoadMapModal(await this.getSavedMapNames())
            let mapName = await modal.waitOnModal()

            this.mapData = await this.server.getMap(mapName)

            if (!this.mapData.permissions.canEdit(currentUser)) {
                this.toolSwitcher.switchToTool(Tool.USE)
            }

            this.mapTiles = this.mapData.tiles
            this.mapDrawer = new MapDrawer(this.mapData)

            this.deleteMap()
            this.drawMap()
        } catch (e) { }
    }

    async changePermissions() {
        try {
            let modal = new PermissionsModal(this.mapData.permissions)
            let newPermissions = await modal.waitOnModal()
            this.mapData.permissions = newPermissions
        } catch (e) { }
    }
    async save() {
        try {
            let modal = new SaveAsModal()
            let mapName = await modal.waitOnModal()

            if (mapName == null) {
                return
            }
            this.server.putMap(mapName, this.mapData)
        } catch (e) { }
    }

    logInOrOut() {
        this.server.logInOrOut()
    }

    up() {
        this.mapDrawer.changeMapPosition(0, -200)
    }

    down() {
        this.mapDrawer.changeMapPosition(0, 200)
    }

    left() {
        this.mapDrawer.changeMapPosition(-256, 0)
    }

    right() {
        this.mapDrawer.changeMapPosition(256, 0)
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
            this.toolSwitcher.currentlyExploring = false
            this.toolSwitcher.currentlyConcealing = false
            this.mouseHeld = false
        }
        if (e.type == 'mousedown' || this.mouseHeld == true) {
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
        if (![Tool.DRAW_IMAGE_COLOR, Tool.DRAW_COLOR, Tool.DRAW_IMAGE].includes(configuration.currentTool)) {
            return
        }
        if (next) {
            if (this.userSettings.currentFavoriteImage == configuration.favoriteImages.length - 1) {
                this.userSettings.currentFavoriteImage = 0
            } else {
                this.userSettings.currentFavoriteImage++
            }
        } else {
            if (this.userSettings.currentFavoriteImage == 0) {
                this.userSettings.currentFavoriteImage = configuration.favoriteImages.length - 1
            } else {
                this.userSettings.currentFavoriteImage--
            }
        }
        this.userSettings.selectedImage = configuration.favoriteImages[this.userSettings.currentFavoriteImage]
        this.drawHexSelector()
    }
    nextSelectedColor(next: boolean) {
        if (![Tool.DRAW_IMAGE_COLOR, Tool.DRAW_COLOR, Tool.DRAW_IMAGE].includes(configuration.currentTool)) {
            return
        }
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
        if (this.userSettings.selectedColor.id === 0) {
            this.nextSelectedColor(next)
        } else {
            this.drawHexSelector()
        }
    }

    drawHexSelector() {
        let selector: HexTile = new HexTile()
        selector.color = this.userSettings.selectedColor
        selector.image = this.userSettings.selectedImage
        this.mapDrawer.drawTile(selector, true)
    }

    addColumn(right: boolean) {
        let tile = new HexTile()
        tile.image = configuration.defaultMapImage
        tile.color = configuration.defaultMapColor
        tile.explored = false

        this.mapTiles.addColumn(right, tile)
        this.drawMap()
    }

    addRow(bottom: boolean) {
        let tile = new HexTile()
        tile.image = configuration.defaultMapImage
        tile.color = configuration.defaultMapColor
        tile.explored = false

        this.mapTiles.addRow(bottom, tile)
        this.drawMap()
    }

    removeRow(bottom: boolean) {
        this.mapTiles.removeRow(bottom)
    }

    resize(width: number, height: number, redraw: boolean) {
        this.canvas.width = width
        this.canvas.height = height
        if (redraw) {
            this.drawMap()
        }
    }

    switchToTool(tool: Tool) {
        if (this.canEdit()) {
            this.toolSwitcher.switchToTool(tool)
            this.drawMap()
        }
    }

    resetMapColors() {
        this.mapData.tileColors.forEach((tileColor) => {
            let defaultTileColor = configuration.defaultMapColors.find((defaultTileColor) => { return defaultTileColor.id == tileColor.id })
            if (defaultTileColor) {
                tileColor.R = defaultTileColor.R
                tileColor.G = defaultTileColor.G
                tileColor.B = defaultTileColor.B
            }
        })
        configuration.defaultMapColors.forEach((defaultTileColor) => {
            if (!this.mapData.tileColors.find((tileColor) => { return tileColor.id == defaultTileColor.id })) {
                this.mapData.tileColors.push(defaultTileColor)
            }
        })
        this.mapDrawer = new MapDrawer(this.mapData)
    }
}