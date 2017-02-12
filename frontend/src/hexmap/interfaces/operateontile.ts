import {HexTile} from "../models/hextile";

export interface OperateOnTile {
    (tile: HexTile): any;
}