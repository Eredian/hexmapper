import { TileColor } from './tilecolor';
import { HexTile } from './hextile';
import { OperateOnTile } from './operateontile';

export class HexMapTiles {
    // First key is x and second key y
    tiles: Map<number, Map<number, HexTile>>;
    invertedTiles: Map<number, Map<number, HexTile>>;

    constructor() {
        this.tiles = new Map<number, Map<number, HexTile>>();
        this.invertedTiles = new Map<number, Map<number, HexTile>>();
    }

    add(x: number, y: number, value: HexTile): void {
        if (!this.tiles.has(x)) {
            this.tiles.set(x, new Map<number, HexTile>());
        }
        this.tiles.get(x) !.set(y, value);
        if (!this.invertedTiles.has(y)) {
            this.invertedTiles.set(y, new Map<number, HexTile>());
        }
        this.invertedTiles.get(y) !.set(x, value);

    }

    has(x: number, y: number): boolean {
        return (this.tiles.has(x) && this.tiles.get(x) !.has(y));
    }

    get(x: number, y: number): HexTile | null {
        if (this.tiles.has(x) && this.tiles.get(x) !.has(y)) {
            return this.tiles.get(x) !.get(y) !;
        }
        return null;
    }

    forEach(func: OperateOnTile) {
        for (let entry1 of this.tiles) {
            for (let entry2 of entry1[1]) {
                func(entry2[1]);
            }
        }
    }

    forEachInFOV(x: number, y: number, func: OperateOnTile) {
        let tiles: [HexTile | null] = [this.get(x, y), this.get(x + 1, y), this.get(x, y + 1), this.get(x - 1, y), this.get(x, y - 1), this.get(x + 1, y - 1), this.get(x - 1, y + 1)];
        tiles.map(func);
    }

    addColumn(right: boolean) {
        let keyFindFunction = Math.min;
        let offset = -1;
        if (right) {
            keyFindFunction = Math.max;
            offset = 1;
        }
        this.invertedTiles.forEach((line: Map<number, HexTile>) => {
            let keys = line.keys();
            let firstElement: HexTile = line.get(keyFindFunction(...keys)) !;

            let tile = new HexTile();
            tile.image = "nothing";
            tile.color = TileColor.NOTHING;
            tile.explored = false;
            tile.x = firstElement.x + offset;
            tile.y = firstElement.y;

            this.add(tile.x, tile.y, tile);
        });
    }

    addRow(bottom: boolean) {
        let keyFindFunction = Math.min;
        let offset = -1;
        if (bottom) {
            keyFindFunction = Math.max;
            offset = 1;
        }
        let rowKeys = this.invertedTiles.keys();
        let rowKey = keyFindFunction(...rowKeys);
        this.invertedTiles.get(rowKey) !.forEach((baseTile: HexTile) => {
            let tile = new HexTile();
            tile.image = "nothing";
            tile.color = TileColor.NOTHING;
            tile.explored = false;
            tile.x = baseTile.x - offset;
            tile.y = baseTile.y + offset;

            this.add(tile.x, tile.y, tile);

            let secondTile = new HexTile();
            secondTile.image = "nothing";
            secondTile.color = TileColor.NOTHING;
            secondTile.explored = false;
            secondTile.x = baseTile.x - offset;
            secondTile.y = baseTile.y + offset * 2;

            this.add(secondTile.x, secondTile.y, secondTile);
        });
    }

    getWidth(): number {
        return this.getTopRightTile().x - this.getTopLeftTile().x;
    }

    getHeight(): number {
        return this.getBottomRightTile().y - this.getTopLeftTile().y + 1;
    }

    getTopLeftTile(): HexTile {
        let minimumY: number = Math.min(...this.invertedTiles.keys());

        let minimumX: number = Math.min(...this.invertedTiles.get(minimumY) !.keys());

        return this.invertedTiles.get(minimumY) !.get(minimumX) !;
    }

    getTopRightTile(): HexTile {
        let minimumY: number = Math.min(...this.invertedTiles.keys());

        let maximumX: number = Math.max(...this.invertedTiles.get(minimumY) !.keys());

        return this.invertedTiles.get(minimumY) !.get(maximumX) !;
    }

    getBottomRightTile(): HexTile {
        let maxYKey: number = Math.max(...this.invertedTiles.keys());
        if (maxYKey != undefined) {
            let maxXKey: number = Math.max(...this.invertedTiles.get(maxYKey) !.keys());
            return this.tiles.get(maxXKey) !.get(maxYKey) !;

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

    export() {
        let tilesArray: HexTile[] = [];
        this.forEach((tile: HexTile) => {
            tilesArray.push(tile);
        })
        return JSON.stringify(tilesArray);
    }

    import(tileData: string) {
        let tilesArray: HexTile[] = JSON.parse(tileData).tiles;
        tilesArray.forEach((tile: HexTile) => {
            this.add(tile.x, tile.y, tile);
        });
    }

    clear() {
        this.tiles = new Map<number, Map<number, HexTile>>();
        this.invertedTiles = new Map<number, Map<number, HexTile>>();
    }
}