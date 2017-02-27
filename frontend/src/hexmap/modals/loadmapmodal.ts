import * as doT from 'dot'
import { Modal } from './modal'

const template = doT.template(
    `<div class="modalBody">
    <p>Choose a map name.</p>
    <form>
        <select id="mapNameSelect">
        {{~it.options :value:index}}
            <option value="{{=value}}">{{=value}}</option>
        {{~}}
        </select>
        <button type="button" id="cancelButton">Cancel</button>
        <button type="button" id="loadButton">Load</button>
    </form>
</div>`)

export class LoadMapModal extends Modal {
    currentMapNames: string[]
    promise: Promise<string>

    constructor(currentMapNames: string[]) {
        super('Load map')
        this.currentMapNames = currentMapNames
    }

    async waitOnModal() {
        this.createModal()
        return this.promise
    }

    setModalContent() {
        let modalHtml = template({ options: this.currentMapNames })

        this.bodyDiv.innerHTML += modalHtml

        this.promise = new Promise((resolve, reject) => {
            this.bodyDiv.querySelector('#loadButton') !.addEventListener('click', () => {
                resolve((<HTMLSelectElement>document.getElementById('mapNameSelect')).value)
            })
            this.bodyDiv.querySelector('#cancelButton') !.addEventListener('click', () => {
                reject()
            })
            this.addDefaultRejection(reject)
        })
        this.promise.then(() => this.deleteModal(), () => this.deleteModal())
    }
}