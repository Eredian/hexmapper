export class ZoomLevel {
    // Values used to move hexes relative to one another
    horizontalXOffset: number
    diagonalXOffset: number
    diagonalYOffset: number
    // Name of folder containing the image files needed
    filePath: string

    constructor(horizontalXOffset: number, diagonalXOffset: number, diagonalYOffset: number, filePath: string) {
        this.horizontalXOffset = horizontalXOffset
        this.diagonalXOffset = diagonalXOffset
        this.diagonalYOffset = diagonalYOffset
        this.filePath = filePath
    }
}