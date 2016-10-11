import {BorderColor} from './bordercolor';
import {TileColor} from './tilecolor';

export class ZoomLevel {
    width: number;
    height: number;
    halfWidth: number;
    halfHeight: number;
    filePath: string;
    ready: boolean = false;

    colorMap: { [key: number]: HTMLImageElement } = {};
    borderColorMap: { [key: number]: HTMLImageElement } = {};

    hiddenCanvas: HTMLCanvasElement = document.createElement("canvas");
    hiddenCanvasContext: CanvasRenderingContext2D;

    constructor(halfWidth: number, halfHeight: number, filePath: string) {
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
        this.filePath = filePath;

        let canvasContext = this.hiddenCanvas.getContext("2d");
        if (canvasContext === null) {
            throw Error("Error creating hidden canvas.");
        }
        this.hiddenCanvasContext = canvasContext;

        let img = new Image();
        img.onload = () => {
            this.hiddenCanvas.width = img.width;
            this.hiddenCanvas.height = img.height;
            this.width = img.width;
            this.height = img.height;
            this.hiddenCanvasContext.drawImage(img, 0, 0);
            let baseHexImage = this.hiddenCanvasContext.getImageData(0, 0, img.width, img.height);

            this.colorMap[TileColor.CAVERN_GROUND] = this.generateColorImage(180, 180, 180, baseHexImage);
            this.colorMap[TileColor.NOTHING] = this.generateColorImage(0, 0, 0, baseHexImage);
            this.colorMap[TileColor.MURKY_WATER] = this.generateColorImage(25, 25, 170, baseHexImage);
            this.colorMap[TileColor.SWAMP_RIVER] = this.generateColorImage(45, 75, 200, baseHexImage);
            this.colorMap[TileColor.LAVA] = this.generateColorImage(255, 55, 20, baseHexImage);
            this.colorMap[TileColor.UNEXPLORED] = this.generateColorImage(255, 204, 102, baseHexImage);
        }
        img.src = 'img/' + filePath + '/hex.png';

        let borderImg = new Image();
        borderImg.onload = () => {
            this.hiddenCanvas.width = borderImg.width;
            this.hiddenCanvas.height = borderImg.height;
            this.hiddenCanvasContext.drawImage(borderImg, 0, 0);
            let baseBorderImage = this.hiddenCanvasContext.getImageData(0, 0, borderImg.width, borderImg.height);

            this.borderColorMap[BorderColor.CR0] = this.generateColorImage(0, 0, 255, baseBorderImage);
            this.borderColorMap[BorderColor.CR1] = this.generateColorImage(0, 127, 127, baseBorderImage);
            this.borderColorMap[BorderColor.CR2] = this.generateColorImage(0, 255, 0, baseBorderImage);
            this.borderColorMap[BorderColor.CR3] = this.generateColorImage(127, 127, 0, baseBorderImage);
            this.borderColorMap[BorderColor.CR4] = this.generateColorImage(255, 0, 0, baseBorderImage);
            this.borderColorMap[BorderColor.CR5] = this.generateColorImage(127, 0, 127, baseBorderImage);
            this.borderColorMap[BorderColor.CR6] = this.generateColorImage(255, 0, 0, baseBorderImage);
            this.ready = true;
        }
        borderImg.src = 'img/' + filePath + '/hexborder.png';
    }

    generateColorImage(R: number, G: number, B: number, baseImage: ImageData) {
        let imageData = this.hiddenCanvasContext.createImageData(baseImage.width, baseImage.height);
        imageData.data.set(baseImage.data);
        let data = imageData.data;
        for (var i = 0, n = data.length; i < n; i += 4) {
            if (data[i + 3] != 0) {
                data[i] = R;
                data[i + 1] = G;
                data[i + 2] = B;
            }
        }
        this.hiddenCanvasContext.putImageData(imageData, 0, 0);
        let img = document.createElement("img");
        img.src = this.hiddenCanvas.toDataURL("image/png");
        return img;
    }
}