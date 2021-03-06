import { configuration } from './configuration'
import { Tool } from './enums/tool'
import { HexMapTiles } from './hexmaptiles'
import { HexTile } from './models/hextile'
import { MapData } from './models/mapdata'
import { ZoomLevel } from './models/zoomlevel'
import { ZoomLevelImages } from './zoomlevelimages'

export class MapDrawer {
    private hexSideLength: number
    private hexHeight: number
    private baseXPos: number = 0
    private baseYPos: number = 0

    private zoomLevel: number = 1
    private mapTiles: HexMapTiles
    private zoomLevelImages: ZoomLevelImages[] = []

    private canvas = <HTMLCanvasElement>document.getElementById('canvas')
    private context = <CanvasRenderingContext2D>this.canvas.getContext('2d')
    private baseImages: { [key: string]: HTMLImageElement }

    private drawBorders: boolean = false

    private isOwner: () => boolean

    constructor(mapData: MapData) {
        this.mapTiles = mapData.tiles
        this.isOwner = () => { return mapData.permissions.currentUserCanEdit() }

        configuration.zoomLevelMap.forEach((zoomLevel: ZoomLevel) => {
            this.zoomLevelImages.push(new ZoomLevelImages(zoomLevel, mapData.tileColors))
        })

        this.updateHexDimensions()
        this.loadImages()
    }

    private loadImages() {
        let xmlhttp = new XMLHttpRequest()
        let url = 'img/images/list.json'
        this.baseImages = {}
        let parent = this
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                let imageNames: [string] = JSON.parse(xmlhttp.responseText)
                imageNames.forEach(function (element) {
                    let baseImage = new Image()
                    baseImage.src = 'img/images/' + element
                    parent.baseImages[element.substr(0, element.length - 4)] = baseImage
                }, parent)
            }
        }
        xmlhttp.open('GET', url, true)
        xmlhttp.send()
    }

    private updateHexDimensions() {
        this.hexSideLength = 35
        this.hexHeight = 2 * this.hexSideLength
    }

    zoomIn() {
        if (!configuration.zoomLevelMap[this.zoomLevel + 1]) {
            return
        }
        this.baseXPos = Math.floor(this.baseXPos * (configuration.zoomLevelMap[this.zoomLevel + 1].horizontalXOffset / configuration.zoomLevelMap[this.zoomLevel].horizontalXOffset))
        this.baseYPos = Math.floor(this.baseYPos * (configuration.zoomLevelMap[this.zoomLevel + 1].diagonalYOffset / configuration.zoomLevelMap[this.zoomLevel].diagonalYOffset))
        this.zoomLevel++
        this.updateHexDimensions()
        this.deleteMap()
        this.drawMap()
    }

    zoomOut() {
        if (!configuration.zoomLevelMap[this.zoomLevel - 1]) {
            return
        }
        this.baseXPos = Math.floor(this.baseXPos * (configuration.zoomLevelMap[this.zoomLevel - 1].horizontalXOffset / configuration.zoomLevelMap[this.zoomLevel].horizontalXOffset))
        this.baseYPos = Math.floor(this.baseYPos * (configuration.zoomLevelMap[this.zoomLevel - 1].diagonalYOffset / configuration.zoomLevelMap[this.zoomLevel].diagonalYOffset))
        this.zoomLevel--
        this.updateHexDimensions()
        this.deleteMap()
        this.drawMap()
    }

    deleteMap() {
        let canvas = <HTMLCanvasElement>document.getElementById('canvas')
        let context = <CanvasRenderingContext2D>canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
    }

    drawMap() {
        if (!this.currentZoomLevel().ready) {
            setTimeout(() => { this.drawMap() }, 10)
            return
        }
        this.repositionMap()
        this.mapTiles.forEach((x) => x != null ? this.drawTile(x) : null)
    }
    repositionMap() {
        let bottomRightTile: HexTile = this.mapTiles.getBottomRightTile()
        let topLeftTile: HexTile = this.mapTiles.getTopLeftTile()

        let leftEdgeOffset: number = this.hex_to_pixel(topLeftTile).x
        let rightEdgeOffset: number = this.hex_to_pixel(bottomRightTile).x + this.currentZoomLevel().width
        let topEdgeOffset: number = this.hex_to_pixel(topLeftTile).y
        let bottomEdgeOffset: number = this.hex_to_pixel(bottomRightTile).y + this.currentZoomLevel().height

        let totalWidth = rightEdgeOffset - leftEdgeOffset
        let totalHeight = bottomEdgeOffset - topEdgeOffset

        if (this.canvas.width > totalWidth) {
            this.baseXPos = Math.floor((totalWidth - this.canvas.width) / 2) + leftEdgeOffset
        } else if (this.baseXPos > rightEdgeOffset - this.canvas.width) {
            this.baseXPos = rightEdgeOffset - this.canvas.width
        } else if (this.baseXPos < leftEdgeOffset) {
            this.baseXPos = leftEdgeOffset
        }
        if (this.canvas.height > totalHeight) {
            this.baseYPos = Math.floor((totalHeight - this.canvas.height) / 2) + topEdgeOffset
        } else if (this.baseYPos > bottomEdgeOffset - this.canvas.height) {
            this.baseYPos = bottomEdgeOffset - this.canvas.height
        } else if (this.baseYPos < topEdgeOffset) {
            this.baseYPos = topEdgeOffset
        }
    }

    drawTile(tile: HexTile, selector: boolean = false, drawHexNumbers: boolean = false) {
        let explored = tile['explored']
        let showHidden = this.isOwner()

        let XPos = selector ? 15 : this.hex_to_pixel(tile).x - this.baseXPos
        let YPos = selector ? 15 : this.hex_to_pixel(tile).y - this.baseYPos

        if (XPos + this.currentZoomLevel().width < 0 || YPos + this.currentZoomLevel().height < 0) {
            return
        }
        if (XPos - this.currentZoomLevel().width > this.canvas.width || YPos - this.currentZoomLevel().height > this.canvas.height) {
            return
        }
        if (explored || showHidden) {
            this.context.drawImage(this.currentZoomLevel().colorMap[tile.color.id], XPos, YPos)
        }

        if (tile.image != 'nothing' && tile.image != '' && (explored || showHidden) && this.currentZoomLevel().width >= 20) {
            let baseImage = this.baseImages[tile.image]
            let imageXPos = XPos - (baseImage.width - this.currentZoomLevel().width) / 2
            let imageYPos = YPos - (baseImage.height - this.currentZoomLevel().height) / 2
            this.context.drawImage(baseImage, imageXPos, imageYPos)
            if (tile.info && tile.info.features && this.currentZoomLevel().width >= 80) {
                if (tile.info.features[0]) {
                    let baseImage = this.baseImages[tile.info.features[0].image]
                    this.context.drawImage(baseImage, imageXPos, imageYPos - baseImage.height - 1)
                }
                if (tile.info.features[1]) {
                    let baseImage = this.baseImages[tile.info.features[1].image]
                    this.context.drawImage(baseImage, imageXPos + baseImage.height, imageYPos)
                }
                if (tile.info.features[2]) {
                    let baseImage = this.baseImages[tile.info.features[2].image]
                    this.context.drawImage(baseImage, imageXPos, imageYPos + baseImage.height)
                }
                if (tile.info.features[3]) {
                    let baseImage = this.baseImages[tile.info.features[3].image]
                    this.context.drawImage(baseImage, imageXPos - baseImage.height, imageYPos)
                }
            }
        }

        if (!explored) {
            if (!showHidden) {
                this.context.drawImage(this.currentZoomLevel().colorMap[0], XPos, YPos)
            } else {
                this.context.globalAlpha = .6
                this.context.drawImage(this.currentZoomLevel().colorMap[0], XPos, YPos)
                this.context.globalAlpha = 1
            }
        }

        if (this.currentZoomLevel().width > 20 && this.drawBorders) {
            this.context.drawImage(this.currentZoomLevel().borderColorMap[Math.abs((tile.x ? tile.x : 0) % 7)], XPos, YPos)
        } else {
            this.context.drawImage(this.currentZoomLevel().borderColorMap[0], XPos, YPos)
        }

        if (drawHexNumbers) {
            this.context.lineWidth = 1
            this.context.textAlign = 'center'
            this.context.font = '12px Verdana'
            this.context.fillStyle = 'black'
            this.context.strokeStyle = 'black'
            this.context.fillText(tile.x + ', ' + tile.y, XPos + this.currentZoomLevel().width / 2, YPos + this.currentZoomLevel().height / 2)
        }
    }

    drawHexSelector(tile: HexTile) {
        this.drawTile(tile, true)
    }

    currentZoomLevel(): ZoomLevelImages {
        return this.zoomLevelImages[this.zoomLevel]
    }

    changeMapPosition(x: number, y: number) {
        this.baseXPos += x
        this.baseYPos += y
        this.deleteMap()
        this.drawMap()
    }

    private pixel_to_hex(x: number, y: number) {
        let zoomLevel = this.currentZoomLevel().zoomLevel
        x -= this.currentZoomLevel().width / 2
        y -= this.currentZoomLevel().height / 2
        let r = y / zoomLevel.diagonalYOffset
        let q = (x - r * zoomLevel.diagonalXOffset) / zoomLevel.horizontalXOffset
        let hexPosition = this.hex_round(q, r)
        return this.mapTiles.get(hexPosition[0], hexPosition[1])
    }

    private hex_to_pixel(tile: HexTile) {
        let zoomLevel = this.currentZoomLevel().zoomLevel
        let x = zoomLevel.horizontalXOffset * tile.x + zoomLevel.diagonalXOffset * tile.y
        let y = zoomLevel.diagonalYOffset * tile.y
        return { 'x': Math.floor(x), 'y': Math.floor(y) }
    }

    private hex_round(q: number, r: number) {
        let x: number = q
        let z: number = r
        let y: number = -x - z

        let rx: number = Math.round(x)
        let ry: number = Math.round(y)
        let rz: number = Math.round(z)

        let x_diff: number = Math.abs(rx - x)
        let y_diff: number = Math.abs(ry - y)
        let z_diff: number = Math.abs(rz - z)

        if (x_diff > y_diff && x_diff > z_diff) {
            rx = -ry - rz
        } else if (y_diff > z_diff) {
            ry = -rx - rz
        } else {
            rz = -rx - ry
        }
        return [rx, rz]
    }

    offsetPixelToHex(x: number, y: number): HexTile | null {
        return this.pixel_to_hex(x + this.baseXPos, y + this.baseYPos)
    }

    drawTileOnAnotherCanvas(canvas: HTMLCanvasElement, tile: HexTile, zoomLevel: number) {
        let explored = tile['explored'] || !([Tool.USE, Tool.EXPLORE].includes(configuration.currentTool))
        let context = canvas.getContext('2d')!
        let XPos: number = 0
        let YPos: number = 0

        if (explored) {
            context.drawImage(this.zoomLevelImages[zoomLevel].colorMap[tile.color.id], XPos, YPos)
        } else {
            context.drawImage(this.zoomLevelImages[zoomLevel].colorMap[0], XPos, YPos)
        }
        if (tile.image != 'nothing' && tile.image != '') {
            let baseImage = this.baseImages[tile.image]
            context.drawImage(baseImage, XPos - (baseImage.width - this.zoomLevelImages[zoomLevel].width) / 2, YPos - (baseImage.height - this.zoomLevelImages[zoomLevel].height) / 2)
        }
    }

    tileWidth(zoomLevel: number) {
        return this.zoomLevelImages[zoomLevel].width
    }
    tileHeight(zoomLevel: number) {
        return this.zoomLevelImages[zoomLevel].height
    }
}