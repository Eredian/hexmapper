import { BorderColor } from '../enums/bordercolor'
import { HexTileInfo } from './hextileinfo'
import { TileColor } from './tilecolor'

export class HexTile {
    x: number
    y: number
    color: TileColor
    borderColor: BorderColor
    image: string
    explored: boolean = false
    info: HexTileInfo

    toJSON() {
        return new HexTileForExport(this)
    }

    static fromJSON(hexTileForExport: HexTileForExport, tileColors: TileColor[]) {
        let tile = new HexTile()
        tile.x = hexTileForExport.x
        tile.y = hexTileForExport.y
        let drawingData = hexTileForExport.drawingData
        tile.color = tileColors[drawingData.color]
        tile.borderColor = drawingData.borderColor
        tile.image = drawingData.image
        tile.explored = drawingData.explored
        if (hexTileForExport.extraData) {
            tile.info = hexTileForExport.extraData
        }
        return tile
    }
}

export class HexTileForExport {
    x: number
    y: number
    drawingData: DrawingData
    extraData: HexTileInfo

    constructor(hexTile: HexTile) {
        this.x = hexTile.x
        this.y = hexTile.y
        this.drawingData = { color: hexTile.color.id, borderColor: hexTile.borderColor, image: hexTile.image, explored: hexTile.explored }
        this.extraData = hexTile.info
    }
}

class DrawingData {
    color: number
    borderColor: BorderColor
    image: string
    explored: boolean
}