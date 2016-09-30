class HexMapTiles {
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

    get(x: number, y: number): HexTile {
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
        var tiles: [HexTile] = [this.get(x, y), this.get(x + 1, y), this.get(x, y + 1), this.get(x - 1, y), this.get(x, y - 1), this.get(x + 1, y - 1), this.get(x - 1, y + 1)];
        tiles.map(func);
    }

    addRow(right: boolean) {
        var topLeftTile: HexTile = this.getTopLeftTile();
        var x: number = topLeftTile.x - 1;
        var y: number = topLeftTile.y;
        var height: number = this.getHeight();
        var newRowHeight: number = 0;
        while (height != newRowHeight) {
            var tile = new HexTile();
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
        var yKeys: string[] = Object.keys(this.invertedTiles);
        yKeys.sort(function (a, b) { return parseInt(a) - parseInt(b) });

        var xKeys: string[] = Object.keys(this.invertedTiles[yKeys[0]]);
        xKeys.sort(function (a, b) { return parseInt(a) - parseInt(b) });

        return Math.max.apply(Math, Object.keys(this.tiles)) + 1;
    }

    getHeight(): number {
        return this.getBottomRightTile().y - this.getTopLeftTile().y + 1;
    }

    getTopLeftTile(): HexTile {
        var yKeys: string[] = Object.keys(this.invertedTiles);
        yKeys.sort(function (a, b) { return parseInt(a) - parseInt(b) });

        var xKeys: string[] = Object.keys(this.invertedTiles[yKeys[0]]);
        xKeys.sort(function (a, b) { return parseInt(a) - parseInt(b) });

        return this.tiles[xKeys[0]][yKeys[0]];
    }

    getBottomRightTile(): HexTile {
        var yKeys: string[] = Object.keys(this.invertedTiles);
        yKeys.sort(function (a, b) { return parseInt(a) - parseInt(b) });
        var lastYKey: number = parseInt(yKeys.pop());
        var xKeys: string[] = Object.keys(this.invertedTiles[lastYKey]);
        xKeys.sort(function (a, b) { return parseInt(a) - parseInt(b) });

        return this.tiles[xKeys.pop()][lastYKey];
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
}