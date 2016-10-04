import {TileColor} from './tilecolor';
import {BorderColor} from './bordercolor';
import {HexTileInfo} from './hextileinfo';

export class HexTile {
    x: number;
    y: number;
    color: TileColor;
    borderColor: BorderColor;
    image: string;
    explored: boolean = false;
    info: HexTileInfo;
}