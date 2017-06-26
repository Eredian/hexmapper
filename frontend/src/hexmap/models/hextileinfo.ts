export class HexTileInfo {
    name: string
    description: string
    secretDescription: string

    constructor(name: string) {
        this.name = name
        this.description = ''
        this.secretDescription = ''
    }
}