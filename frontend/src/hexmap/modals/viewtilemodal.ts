import * as doT from 'dot'
import { MapDrawer } from '../mapdrawer'
import { HexTile } from '../models/hextile'
import { HexTileInfo } from '../models/hextileinfo'
import { Modal } from './modal'

const titleTemplate = doT.template(`<h2>{{=it.title}}</h2>{{? it.name }}<button id="titleEditButton" class="editToggleButton fa fa-pencil"></button>{{?}}`)

const bodyTemplate = doT.template(
    `<div class="tileModalBody">
    <div>
    <div class="tileModalBodyTileView">
        <canvas id="tileViewCanvas" width="{{=it.canvasWidth}}" height="{{=it.canvasHeight}}"></canvas>
        <p id="tileViewTerrainName">{{=it.terrainName}}</p>
        <p id="tileViewFeatureName">{{=it.featureName}}</p>
    </div>`+
    `<div class="tileModalBodyDescription">
        <p id="tileDescription">{{=it.description}}</p>{{? it.name }}<button id="descriptionEditButton" class="editToggleButton fa fa-pencil"></button>{{?}}
    </div>
    </div>
    
    <div id="tileFeatureSection">
    <div id="tileMonsterBar">
    </div>
    <div id="tileLocationBar">
    </div>
    <div id="tileFeatureDescription">
    </div>
    </div>
    {{? it.name }}
    <div>
        <button type="button" id="discardButton" class="button">Discard</button>
        <button type="button" id="saveButton" class="button">Save</button>
    </div>
    {{?}}
</div>`)

export class ViewTileModal extends Modal {
    tile: HexTile
    mapDrawer: MapDrawer
    canEdit: boolean

    constructor(tile: HexTile, mapDrawer: MapDrawer, canEdit: boolean) {
        if (!tile.info) {
            tile.info = new HexTileInfo(`${tile.x},${tile.y}`)
            tile.info.description = 'This description hasn\'t been done yet.'
        }
        super()
        this.tile = tile
        this.mapDrawer = mapDrawer
        this.canEdit = canEdit
    }

    setModalContent() {
        this.bodyDiv.innerHTML += bodyTemplate({
            description: this.tile.info.description,
            canvasWidth: this.mapDrawer.tileWidth(2), canvasHeight: this.mapDrawer.tileHeight(2),
            terrainName: this.tile.color.name, featureName: this.tile.image,
            canEdit: this.canEdit
        })

        this.titleDiv.innerHTML = titleTemplate({
            title: this.tile.info.name,
            canEdit: this.canEdit
        })

        this.mapDrawer.drawTileOnAnotherCanvas(<HTMLCanvasElement>this.bodyDiv.querySelector('#tileViewCanvas'), this.tile, 2)

        if (this.canEdit) {
            this.titleDiv.querySelector('#titleEditButton')!.addEventListener('click', () =>
            { this.toggleEditable(this.titleDiv.querySelector('h2')!) })

            this.bodyDiv.querySelector('#descriptionEditButton')!.addEventListener('click', () =>
            { this.toggleEditable(<HTMLParagraphElement>this.bodyDiv.querySelector('#tileDescription')!) })
        }

        let promise = new Promise((resolve, reject) => {
            if (this.canEdit) {
                this.bodyDiv.querySelector('#saveButton')!.addEventListener('click', () => {
                    this.saveTile()
                    resolve()
                })
                this.bodyDiv.querySelector('#discardButton')!.addEventListener('click', () => {
                    reject()
                })
            }
            this.addDefaultRejection(reject)
        })

        promise.then(() => this.deleteModal(), () => this.deleteModal())
    }

    toggleEditable(element: HTMLElement) {
        let contentEditable = element.contentEditable
        if (contentEditable == 'true') {
            element.contentEditable = 'false'
        } else {
            element.contentEditable = 'true'
        }
    }

    saveTile() {
        this.tile.info.name = (this.titleDiv.querySelector('h2'))!.innerText
        this.tile.info.description = (<HTMLParagraphElement>this.bodyDiv.querySelector('#tileDescription')).innerText
    }
}