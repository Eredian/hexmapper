export class HexTileInfo {
    name: string
    description: string
    secretDescription: string

    features: HexTileInfo[]

    constructor(name: string) {
        this.name = name
        this.description = ''
        this.secretDescription = ''
        this.features = []
    }
}