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
        tile.color = tileColors[hexTileForExport.color]
        tile.borderColor = hexTileForExport.borderColor
        tile.image = hexTileForExport.image
        tile.explored = hexTileForExport.explored
        tile.info = hexTileForExport.info
        return tile
    }
}

export class HexTileForExport {
    x: number
    y: number
    color: number
    borderColor: BorderColor
    image: string
    explored: boolean = false
    info: HexTileInfo

    constructor(hexTile: HexTile) {
        this.x = hexTile.x
        this.y = hexTile.y
        this.color = hexTile.color.id
        this.borderColor = hexTile.borderColor
        this.image = hexTile.image
        this.explored = hexTile.explored
        this.info = hexTile.info
    }
}