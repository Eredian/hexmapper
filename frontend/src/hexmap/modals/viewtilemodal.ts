import * as doT from 'dot'
import { HexTile } from '../models/hextile'
import {HexTileInfo} from '../models/hextileinfo'
import { Modal } from './modal'

let template = doT.template(
    `<div class="modalBody">
    <p>Description: </p>
    <form>
    <textarea name="description" id="descriptionTextarea">{{=it.description}}</textarea>
        <button type="button" id="discardButton">Discard</button>
        <button type="button" id="saveButton">Save</button>
    </form>
</div>`
)

export class ViewTileModal extends Modal {
    tile: HexTile

    constructor(tile: HexTile) {
        if (!tile.info) {
            tile.info = new HexTileInfo(`${tile.x},${tile.y}`)
        }
        super('View tile ' + tile.info.name)
        this.tile = tile
    }

    setModalContent() {
        let modalHtml = template({ description: this.tile.info.description })

        this.bodyDiv.innerHTML += modalHtml

        new Promise((resolve, reject) => {
            this.bodyDiv.querySelector('#saveButton') !.addEventListener('click', () => {
                this.saveTile()
                resolve()
                this.deleteModal()
            })
            this.bodyDiv.querySelector('#discardButton') !.addEventListener('click', () => {
                reject()
                this.deleteModal()
            })
        })
    }

    saveTile() {
        this.tile.info.description = (<HTMLTextAreaElement>this.bodyDiv.querySelector('#descriptionTextarea')).value
    }
}