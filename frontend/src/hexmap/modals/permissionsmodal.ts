import * as doT from 'dot'
import { MapPermissions } from '../models/mappermissions'
import { Modal } from './modal'

const template = doT.template(
    `<div class="modalBody">
    <form>
        <textarea id="ownerInput">{{=it.owners}}</textarea>
        <textarea id="userInput">{{=it.users}}</textarea>
        <button type="button" id="cancelButton" class="button">Cancel</button>
        <button type="button" id="saveButton" class="button">Save</button>
    </form>
</div>`)

export class PermissionsModal extends Modal {
    currentPermissions: MapPermissions
    promise: Promise<MapPermissions>

    constructor(currentPermissions: MapPermissions) {
        super('Permissions')
        this.currentPermissions = currentPermissions
    }

    async waitOnModal() {
        this.createModal()
        return this.promise
    }

    setModalContent() {
        let modalHtml = template({
            owners: Array.from(this.currentPermissions.owners).reduce((val1, val2) => `${val1}, ${val2}`),
            users: Array.from(this.currentPermissions.users).reduce((val1, val2) => `${val1}, ${val2}`)
        })

        this.bodyDiv.innerHTML += modalHtml

        this.promise = new Promise((resolve, reject) => {
            this.bodyDiv.querySelector('#saveButton')!.addEventListener('click', () => {
                resolve(this.collectUpdatedPermissions())
            })
            this.bodyDiv.querySelector('#cancelButton')!.addEventListener('click', () => {
                reject()
            })
            this.addDefaultRejection(reject)
        })
        this.promise.then(() => this.deleteModal(), () => this.deleteModal())
    }

    collectUpdatedPermissions() {
        let owners = (<HTMLTextAreaElement>document.getElementById('ownerInput')).value
        let users = (<HTMLTextAreaElement>document.getElementById('userInput')).value

        let newPermissions = new MapPermissions('')
        newPermissions.owners = new Set(owners.split(',').map((string: string) => string.trim()).filter((string) => string))
        newPermissions.users = new Set(users.split(',').map((string: string) => string.trim()).filter((string) => string))

        newPermissions.owners.forEach((owner) => newPermissions.users.add(owner))

        return newPermissions
    }
}