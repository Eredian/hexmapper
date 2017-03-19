export class ZoomLevel {
    // These units aren't quite half they're used to calculate hex distance
    halfWidth: number
    halfHeight: number
    // Name of folder containing the image files needed
    filePath: string

    width: number
    height: number

    constructor(halfWidth: number, halfHeight: number, filePath: string) {
        this.halfWidth = halfWidth
        this.halfHeight = halfHeight
        this.filePath = filePath
    }
}