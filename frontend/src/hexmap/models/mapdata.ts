import { HexMapTiles } from '../hexmaptiles'
import { MapPermissions } from './mappermissions'
import { MapSettings } from './mapsettings'
import { TileColor } from './tilecolor'

export class MapData {
    tiles: HexMapTiles
    settings: MapSettings
    tileColors: TileColor[]
    permissions: MapPermissions

    constructor(tiles: HexMapTiles, mapSettings: MapSettings, tileColors: TileColor[], MapPermissions: MapPermissions) {
        this.tiles = tiles
        this.settings = mapSettings
        this.tileColors = tileColors
        this.permissions = MapPermissions
    }

    static fromJSON(tileData: string): MapData {
        let data = JSON.parse(tileData).tiles

        let object: MapData = Object.create(MapData.prototype)
        object.tileColors = data.tileColors
        object.settings = data.mapSettings
        object.tiles = HexMapTiles.fromJSON(data.tiles, object.tileColors)
        object.permissions = MapPermissions.fromJSON(data.permissions)
        return object
    }
}