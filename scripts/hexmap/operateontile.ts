import {HexTile} from './hextile';

export interface OperateOnTile {
    (tile: HexTile): any;
}