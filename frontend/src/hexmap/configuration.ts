import { TileColor } from './tilecolor';
import { Mode } from './hexmap';
import { ZoomLevel } from './zoomlevel';
import { utils } from '../utils/urlobject';

export class Configuration {

    zoomLevelMap: { [key: number]: ZoomLevel } = {};
    mode: Mode = Mode.EXPLORE;
    favoriteImages: string[] = [];
    defaultMapImage: string;
    defaultMapColor: TileColor = TileColor.CAVERN_GROUND;
    defaultMapSize: number = 50;

    constructor() {
        this.zoomLevelMap[0] = new ZoomLevel(7, 11, "zoomlevel0");
        this.zoomLevelMap[1] = new ZoomLevel(30, 53, "zoomlevel1");
        this.zoomLevelMap[2] = new ZoomLevel(70, 121, "zoomlevel2");

        this.favoriteImages.push("nothing");
        this.favoriteImages.push("stalagmites");
        this.favoriteImages.push("fungalforest");
        this.favoriteImages.push("fungalforestheavy");
        this.favoriteImages.push("battle");
        this.favoriteImages.push("battleprimitive");
        this.favoriteImages.push("bridge");
        this.favoriteImages.push("camp");
        this.favoriteImages.push("castle");
        this.favoriteImages.push("cathedral");
        this.favoriteImages.push("cave");
        this.favoriteImages.push("church");
        this.favoriteImages.push("city");
        this.favoriteImages.push("crater");
        this.favoriteImages.push("crossbones");
        this.favoriteImages.push("cultivatedfarmland");
        this.favoriteImages.push("dragon");
        this.favoriteImages.push("dungeon");
        this.favoriteImages.push("fort");
        this.favoriteImages.push("mines");
        this.favoriteImages.push("monolith");
        this.favoriteImages.push("monsterlair");
        this.favoriteImages.push("pointofinterest");
        this.favoriteImages.push("shrubland");
        this.favoriteImages.push("skullcrossbones");
        this.favoriteImages.push("tower");
        this.favoriteImages.push("waystation");

        this.defaultMapImage = this.favoriteImages[0];

        if (utils.urlObject({})["parameters"]["mode"] == "edit") {
            this.mode = Mode.EDIT;
        } else {
            this.mode = Mode.EXPLORE;
        }
    }
}