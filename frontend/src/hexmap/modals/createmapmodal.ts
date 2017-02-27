import { Modal } from './modal'

export class CreateMapModal extends Modal {
    promise: Promise<string>

    constructor() {
        super('Create new map')
    }

    async waitOnModal() {
        this.createModal()
        return this.promise
    }

    setModalContent() {
        let description = document.createElement('p')
        description.textContent = 'Choose a map name.'
        this.bodyDiv.appendChild(description)

        let form = document.createElement('form')
        let nameInput = document.createElement('input')
        form.appendChild(nameInput)

        let cancelButton = document.createElement('button')
        cancelButton.textContent = 'Cancel'
        cancelButton.type = 'button'
        form.appendChild(cancelButton)
        let saveButton = document.createElement('button')
        saveButton.textContent = 'Create'
        saveButton.type = 'button'
        form.appendChild(saveButton)

        this.promise = new Promise((resolve, reject) => {
            saveButton.addEventListener('click', () => {
                resolve(nameInput.value)
            })
            cancelButton.addEventListener('click', () => {
                reject()
            })
            this.addDefaultRejection(reject)
        })
        this.promise.then(() => this.deleteModal(), () => this.deleteModal())

        this.bodyDiv.appendChild(form)
    }
}