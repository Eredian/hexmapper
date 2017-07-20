import { HexTileFeature } from './hextilefeature'

export class HexTileInfo {
    name: string
    description: string
    secretDescription: string

    features: HexTileFeature[]

    constructor(name: string) {
        this.name = name
        this.description = ''
        this.secretDescription = ''
        this.features = []
    }
}