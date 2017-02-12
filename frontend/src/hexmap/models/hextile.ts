import {TileColor} from "../enums/tilecolor";
import {BorderColor} from "../enums/bordercolor";
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