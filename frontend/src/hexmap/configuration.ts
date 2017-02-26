import { TileColor } from './models/tilecolor'
import { ZoomLevel } from './models/zoomlevel'
import { Tool } from './toolswitcher'

export class Configuration {

    zoomLevelMap: ZoomLevel[] = []
    currentTool: Tool = Tool.USE
    favoriteImages: string[] = []
    defaultMapImage: string
    defaultMapColor: TileColor
    defaultMapColors: TileColor[]
    defaultMapSize: number = 50

    constructor() {
        this.zoomLevelMap.push(new ZoomLevel(7, 11, 'zoomlevel0'))
        this.zoomLevelMap.push(new ZoomLevel(30, 53, 'zoomlevel1'))
        this.zoomLevelMap.push(new ZoomLevel(70, 121, 'zoomlevel2'))

        this.favoriteImages.push('nothing')
        this.favoriteImages.push('stalagmites')
        this.favoriteImages.push('fungalforest')
        this.favoriteImages.push('fungalforestheavy')
        this.favoriteImages.push('battle')
        this.favoriteImages.push('battleprimitive')
        this.favoriteImages.push('bridge')
        this.favoriteImages.push('camp')
        this.favoriteImages.push('castle')
        this.favoriteImages.push('cathedral')
        this.favoriteImages.push('cave')
        this.favoriteImages.push('church')
        this.favoriteImages.push('city')
        this.favoriteImages.push('crater')
        this.favoriteImages.push('crossbones')
        this.favoriteImages.push('cultivatedfarmland')
        this.favoriteImages.push('dragon')
        this.favoriteImages.push('dungeon')
        this.favoriteImages.push('fort')
        this.favoriteImages.push('mines')
        this.favoriteImages.push('monolith')
        this.favoriteImages.push('monsterlair')
        this.favoriteImages.push('pointofinterest')
        this.favoriteImages.push('shrubland')
        this.favoriteImages.push('skullcrossbones')
        this.favoriteImages.push('tower')
        this.favoriteImages.push('waystation')

        this.defaultMapColors = []
        this.defaultMapColors.push(new TileColor(0, 'Unexplored', 255, 204, 102))
        this.defaultMapColors.push(new TileColor(1, 'Nothing', 0, 0, 0))
        this.defaultMapColors.push(new TileColor(2, 'Water', 25, 25, 170))
        this.defaultMapColors.push(new TileColor(3, 'Lava', 255, 55, 20))
        this.defaultMapColors.push(new TileColor(4, 'Grass', 40, 200, 40))
        this.defaultMapColor = this.defaultMapColors[4]

        this.defaultMapImage = this.favoriteImages[0]
    }
}