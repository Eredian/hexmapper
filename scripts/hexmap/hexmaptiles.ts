import {TileColor} from './tilecolor';
import {HexTile} from './hextile';
import {OperateOnTile} from './operateontile';

export class HexMapTiles {
    // First key is x and second key y
    tiles: { [key: number]: { [key: number]: HexTile } };
    invertedTiles: { [key: number]: { [key: number]: HexTile } };

    constructor() {
        this.tiles = {};
        this.invertedTiles = {};
    }

    add(x: number, y: number, value: HexTile): void {
        if (this.tiles[x] == null) {
            this.tiles[x] = {};
        }
        this.tiles[x][y] = value;
        if (this.invertedTiles[y] == null) {
            this.invertedTiles[y] = {};
        }
        this.invertedTiles[y][x] = value;
    }

    has(x: number, y: number): boolean {
        if (x in this.tiles) {
            y in this.tiles[x];
        }
        return false;
    }

    get(x: number, y: number): HexTile | null {
        if (this.tiles[x] != null) {
            return this.tiles[x][y];
        }
        return null;
    }

    forEach(func: OperateOnTile) {
        for (var key1 in this.tiles) {
            if (this.tiles.hasOwnProperty(key1)) {
                for (var key2 in this.tiles[key1]) {
                    if (this.tiles[key1].hasOwnProperty(key2)) {
                        func(this.tiles[key1][key2]);
                    }
                }
            }
        }
    }

    forEachInFOV(x: number, y: number, func: OperateOnTile) {
        let tiles: [HexTile | null] = [this.get(x, y), this.get(x + 1, y), this.get(x, y + 1), this.get(x - 1, y), this.get(x, y - 1), this.get(x + 1, y - 1), this.get(x - 1, y + 1)];
        tiles.map(func);
    }

    addRow(right: boolean) {
        if (right) {}
        let topLeftTile: HexTile = this.getTopLeftTile();
        let x: number = topLeftTile.x - 1;
        let y: number = topLeftTile.y;
        let height: number = this.getHeight();
        let newRowHeight: number = 0;
        while (height != newRowHeight) {
            let tile = new HexTile();
            tile.image = "nothing";
            tile.color = TileColor.NOTHING;
            tile.explored = false;
            tile.x = x;
            tile.y = y;

            this.add(x, y, tile);

            if (newRowHeight % 2 == 0) {
                y++;
            } else {
                y++;
                x--;
            }
            newRowHeight++;

        }


    }

    getWidth(): number {
        let yKeys: number[] = Object.keys(this.invertedTiles).map(this.toInt);
        yKeys.sort(function (a, b) { return a - b });

        let xKeys: number[] = Object.keys(this.invertedTiles[yKeys[0]]).map(this.toInt);
        xKeys.sort(function (a, b) { return a - b });

        return Math.max.apply(Math, Object.keys(this.tiles)) + 1;
    }

    getHeight(): number {
        return this.getBottomRightTile().y - this.getTopLeftTile().y + 1;
    }

    getTopLeftTile(): HexTile {
        let yKeys: number[] = Object.keys(this.invertedTiles).map(this.toInt);
        yKeys.sort(function (a, b) { return a - b });

        let xKeys: number[] = Object.keys(this.invertedTiles[yKeys[0]]).map(this.toInt);
        xKeys.sort(function (a, b) { return a - b });

        return this.tiles[xKeys[0]][yKeys[0]];
    }

    getBottomRightTile(): HexTile {
        let yKeys: number[] = Object.keys(this.invertedTiles).map(this.toInt);
        yKeys.sort(function (a, b) { return a - b });
        let lastYKey: number | undefined = yKeys.pop();
        if (lastYKey != undefined) {
            let xKeys: number[] = Object.keys(this.invertedTiles[lastYKey]).map(this.toInt);
            xKeys.sort(function (a, b) { return a - b });
            let lastXKey: number | undefined = xKeys.pop();
            if (lastXKey != undefined) {
                return this.tiles[lastXKey][lastYKey];
            }
        }
        throw Error("Could not find the bottom right tile.");
    }

    setTiles(tiles: { [key: number]: { [key: number]: HexTile } }) {
        for (var key1 in tiles) {
            if (tiles.hasOwnProperty(key1)) {
                for (var key2 in tiles[key1]) {
                    if (tiles[key1].hasOwnProperty(key2)) {
                        this.add(+key1, +key2, tiles[key1][key2]);
                    }
                }
            }
        }
    }

    toInt(string: string) {
        return parseInt(string);
    }
}