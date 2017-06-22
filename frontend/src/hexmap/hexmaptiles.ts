import { OperateOnTile } from './interfaces/operateontile'
import { HexTileForExport } from './models/hextile'
import { HexTile } from './models/hextile'
import { TileColor } from './models/tilecolor'

export class HexMapTiles {
    private tiles: Map<number, Map<number, HexTile>> = new Map<number, Map<number, HexTile>>()
    private invertedTiles: Map<number, Map<number, HexTile>> = new Map<number, Map<number, HexTile>>()

    constructor(defaultTile: HexTile, width: number, height: number) {
        this.initialize(defaultTile, width, height)
    }

    add(x: number, y: number, value: HexTile): void {
        if (!this.tiles.has(x)) {
            this.tiles.set(x, new Map<number, HexTile>())
        }
        this.tiles.get(x)!.set(y, value)
        if (!this.invertedTiles.has(y)) {
            this.invertedTiles.set(y, new Map<number, HexTile>())
        }
        this.invertedTiles.get(y)!.set(x, value)
    }

    remove(x: number, y: number): void {
        if (this.tiles.has(x) && this.tiles.get(x)!.has(y)) {
            this.tiles.get(x)!.delete(y)
            if (this.tiles.get(x)!.size == 0) {
                this.tiles.delete(x)
            }
            this.invertedTiles.get(y)!.delete(x)
            if (this.invertedTiles.get(y)!.size == 0) {
                this.invertedTiles.delete(y)
            }
        }
    }

    has(x: number, y: number): boolean {
        return (this.tiles.has(x) && this.tiles.get(x)!.has(y))
    }

    get(x: number, y: number): HexTile | null {
        if (this.tiles.has(x) && this.tiles.get(x)!.has(y)) {
            return this.tiles.get(x)!.get(y)!
        }
        return null
    }

    forEach(func: OperateOnTile) {
        for (let entry1 of this.tiles) {
            for (let entry2 of entry1[1]) {
                func(entry2[1])
            }
        }
    }

    forEachInFOV(x: number, y: number, func: OperateOnTile) {
        let tiles: [HexTile | null] = [this.get(x, y), this.get(x + 1, y), this.get(x, y + 1), this.get(x - 1, y), this.get(x, y - 1), this.get(x + 1, y - 1), this.get(x - 1, y + 1)]
        tiles.map(func)
    }

    addColumn(right: boolean, defaultTile: HexTile) {
        let keyFindFunction = Math.min
        let offset = -1
        if (right) {
            keyFindFunction = Math.max
            offset = 1
        }
        this.invertedTiles.forEach((line: Map<number, HexTile>) => {
            let keys = line.keys()
            let firstElement: HexTile = line.get(keyFindFunction(...keys))!

            let tile = new HexTile()
            tile.image = defaultTile.image
            tile.color = defaultTile.color
            tile.explored = defaultTile.explored
            tile.x = firstElement.x + offset
            tile.y = firstElement.y

            this.add(tile.x, tile.y, tile)
        })
    }

    addRow(bottom: boolean, defaultTile: HexTile) {
        let keyFindFunction = Math.min
        let offset = -1
        if (bottom) {
            keyFindFunction = Math.max
            offset = 1
        }
        let rowKeys = this.invertedTiles.keys()
        let rowKey = keyFindFunction(...rowKeys)
        this.invertedTiles.get(rowKey)!.forEach((baseTile: HexTile) => {
            let tile = new HexTile()
            tile.image = defaultTile.image
            tile.color = defaultTile.color
            tile.explored = defaultTile.explored
            tile.x = baseTile.x - offset
            tile.y = baseTile.y + offset

            this.add(tile.x, tile.y, tile)

            let secondTile = new HexTile()
            tile.image = defaultTile.image
            tile.color = defaultTile.color
            tile.explored = defaultTile.explored
            secondTile.x = baseTile.x - offset
            secondTile.y = baseTile.y + offset * 2

            this.add(secondTile.x, secondTile.y, secondTile)
        })
    }

    removeRow(bottom: boolean) {
        if (!bottom) {
            let topLeftTile = this.getTopLeftTile()
            this.invertedTiles.get(topLeftTile.y)!.forEach((tile) => this.remove(tile.x, tile.y))
        } else {
            let bottomRightTile = this.getBottomRightTile()
            this.invertedTiles.get(bottomRightTile.y)!.forEach((tile) => this.remove(tile.x, tile.y))
        }
    }

    getWidth(): number {
        return this.getTopRightTile().x - this.getTopLeftTile().x
    }

    getHeight(): number {
        return this.getBottomRightTile().y - this.getTopLeftTile().y + 1
    }

    getTopLeftTile(): HexTile {
        let minimumY: number = Math.min(...this.invertedTiles.keys())

        let minimumX: number = Math.min(...this.invertedTiles.get(minimumY)!.keys())

        return this.invertedTiles.get(minimumY)!.get(minimumX)!
    }

    getTopRightTile(): HexTile {
        let minimumY: number = Math.min(...this.invertedTiles.keys())

        let maximumX: number = Math.max(...this.invertedTiles.get(minimumY)!.keys())

        return this.invertedTiles.get(minimumY)!.get(maximumX)!
    }

    getBottomRightTile(): HexTile {
        let maxYKey: number = Math.max(...this.invertedTiles.keys())
        if (maxYKey != undefined) {
            let maxXKey: number = Math.max(...this.invertedTiles.get(maxYKey)!.keys())
            return this.tiles.get(maxXKey)!.get(maxYKey)!

        }
        throw Error('Could not find the bottom right tile.')
    }

    initialize(defaultTile: HexTile, width: number, height: number) {
        this.clear()
        for (var column = 0; column < width; column++) {
            let x = column
            let y = 0

            for (var row = 0; row < height; row++) {
                let tile = new HexTile()
                tile.image = defaultTile.image
                tile.color = defaultTile.color
                tile.explored = defaultTile.explored
                tile.x = x
                tile.y = y

                this.add(x, y, tile)

                if (row % 2 == 0) {
                    y++
                } else {
                    y++
                    x--
                }
            }
        }
    }

    toJSON(): HexTileForExport[] {
        let tilesArray: HexTileForExport[] = []
        this.forEach((tile: HexTile) => {
            tilesArray.push(tile.toJSON())
        })
        return tilesArray
    }

    static fromJSON(tiles: HexTileForExport[], colors: TileColor[]): HexMapTiles {
        let object: HexMapTiles = Object.create(HexMapTiles.prototype)
        object.tiles = new Map<number, Map<number, HexTile>>()
        object.invertedTiles = new Map<number, Map<number, HexTile>>()
        tiles.forEach((tile: HexTileForExport) => {
            object.add(tile.x, tile.y, HexTile.fromJSON(tile, colors))
        })
        return object
    }

    clear() {
        this.tiles = new Map<number, Map<number, HexTile>>()
        this.invertedTiles = new Map<number, Map<number, HexTile>>()
    }
}