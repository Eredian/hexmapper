import { TileColor } from './tilecolor';
import { MapSettings } from './mapsettings';
import { HexMapTiles } from '../hexmaptiles';

export class MapData {
    tiles: HexMapTiles;
    mapSettings: MapSettings;
    tileColors: TileColor[]

    constructor(tiles: HexMapTiles, mapSettings: MapSettings, tileColors: TileColor[]) {
        this.tiles = tiles;
        this.mapSettings = mapSettings;
        this.tileColors = tileColors;
    }


    exportAsJSON() {
        return JSON.stringify({ tiles: this.tiles.exportAsTileArray(), mapSettings: this.mapSettings, tileColors: [...this.tileColors] });
    }

    static createFromJSON(tileData: string): MapData {
        let data = JSON.parse(tileData).tiles;

        let object: MapData = Object.create(MapData.prototype)
        object.tiles = HexMapTiles.createFromTileArray(data.tiles)
        object.tileColors = data.tileColors
        object.mapSettings = data.mapSettings
        return object
    }
}