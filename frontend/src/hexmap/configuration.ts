import { Tool } from './enums/tool'
import { TileColor } from './models/tilecolor'
import { ZoomLevel } from './models/zoomlevel'

class Configuration {

    zoomLevelMap: ZoomLevel[] = []
    currentTool: Tool = Tool.USE
    favoriteImages: string[] = []
    defaultMapImage: string
    defaultMapColor: TileColor
    defaultMapColors: TileColor[]
    defaultMapSize: number = 50

    constructor() {
        this.zoomLevelMap.push(new ZoomLevel(14, 7, 11, 'zoomlevel0'))
        this.zoomLevelMap.push(new ZoomLevel(70, 35, 61, 'zoomlevel1'))
        this.zoomLevelMap.push(new ZoomLevel(158, 79, 137, 'zoomlevel2'))

        this.favoriteImages.push('nothing')
        this.favoriteImages.push('anchor')
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
        this.favoriteImages.push('evergreen')
        this.favoriteImages.push('evergreenhills')
        this.favoriteImages.push('evergreenwetlands')
        this.favoriteImages.push('swamp')
        this.favoriteImages.push('jungle')
        this.favoriteImages.push('junglewetlands')
        this.favoriteImages.push('fort')
        this.favoriteImages.push('grassland')
        this.favoriteImages.push('heavyevergreen')
        this.favoriteImages.push('mines')
        this.favoriteImages.push('monolith')
        this.favoriteImages.push('monsterlair')
        this.favoriteImages.push('mountain')
        this.favoriteImages.push('mountains')
        this.favoriteImages.push('snowcappedmountains')
        this.favoriteImages.push('evergreenmountains')
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
        this.defaultMapColors.push(new TileColor(4, 'Grass', 8, 219, 43))
        this.defaultMapColors.push(new TileColor(5, 'Sand', 237, 221, 9))
        this.defaultMapColor = this.defaultMapColors[4]

        this.defaultMapImage = this.favoriteImages[0]
    }
}

export let configuration = new Configuration()