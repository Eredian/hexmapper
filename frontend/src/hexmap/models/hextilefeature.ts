export class HexTileFeature {
    name: string
    image: string
    description: string
    secretDescription: string

    constructor(name: string, image: string) {
        this.name = name
        this.image = image
        this.description = ''
        this.secretDescription = ''
    }
}