import { BorderColor } from './enums/bordercolor'
import { TileColor } from './models/tilecolor'
import { ZoomLevel } from './models/zoomlevel'

export class ZoomLevelImages {
    zoomLevel: ZoomLevel
    width: number
    height: number
    ready: boolean = false

    private hiddenCanvas: HTMLCanvasElement = document.createElement('canvas')
    private hiddenCanvasContext: CanvasRenderingContext2D

    colorMap: { [key: number]: HTMLImageElement } = {}
    borderColorMap: { [key: number]: HTMLImageElement } = {}

    constructor(zoomLevel: ZoomLevel, colorMap: TileColor[]) {
        this.zoomLevel = zoomLevel

        let canvasContext = this.hiddenCanvas.getContext('2d')
        if (canvasContext === null) {
            throw Error('Error creating hidden canvas.')
        }
        this.hiddenCanvasContext = canvasContext

        let img = new Image()
        img.onload = () => {
            this.hiddenCanvas.width = img.width
            this.hiddenCanvas.height = img.height
            this.width = img.width
            this.height = img.height
            this.hiddenCanvasContext.drawImage(img, 0, 0)
            let baseHexImage = this.hiddenCanvasContext.getImageData(0, 0, img.width, img.height)

            colorMap.forEach((value: TileColor, key: number) => {
                this.colorMap[key] = this.generateColorImage(value.R, value.G, value.B, baseHexImage)
            })
        }
        img.src = 'img/' + this.zoomLevel.filePath + '/hex.png'

        let borderImg = new Image()
        borderImg.onload = () => {
            this.hiddenCanvas.width = borderImg.width
            this.hiddenCanvas.height = borderImg.height
            this.hiddenCanvasContext.drawImage(borderImg, 0, 0)
            let baseBorderImage = this.hiddenCanvasContext.getImageData(0, 0, borderImg.width, borderImg.height)

            this.borderColorMap[BorderColor.BLACK] = this.generateColorImage(0, 0, 0, baseBorderImage)
            this.borderColorMap[BorderColor.CR0] = this.generateColorImage(0, 0, 255, baseBorderImage)
            this.borderColorMap[BorderColor.CR1] = this.generateColorImage(0, 127, 127, baseBorderImage)
            this.borderColorMap[BorderColor.CR2] = this.generateColorImage(0, 255, 0, baseBorderImage)
            this.borderColorMap[BorderColor.CR3] = this.generateColorImage(127, 127, 0, baseBorderImage)
            this.borderColorMap[BorderColor.CR4] = this.generateColorImage(255, 0, 0, baseBorderImage)
            this.borderColorMap[BorderColor.CR5] = this.generateColorImage(127, 0, 127, baseBorderImage)
            this.borderColorMap[BorderColor.CR6] = this.generateColorImage(255, 0, 0, baseBorderImage)
            this.ready = true
        }
        borderImg.src = 'img/' + this.zoomLevel.filePath + '/hexborder.png'
    }

    private generateColorImage(R: number, G: number, B: number, baseImage: ImageData) {
        let imageData = this.hiddenCanvasContext.createImageData(baseImage.width, baseImage.height)
        imageData.data.set(baseImage.data)
        let data = imageData.data
        for (var i = 0, n = data.length; i < n; i += 4) {
            if (data[i + 3] != 0) {
                data[i] = R
                data[i + 1] = G
                data[i + 2] = B
            }
        }
        this.hiddenCanvasContext.putImageData(imageData, 0, 0)
        let img = document.createElement('img')
        img.src = this.hiddenCanvas.toDataURL('image/png')
        return img
    }
}