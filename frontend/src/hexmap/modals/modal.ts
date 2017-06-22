import * as doT from 'dot'

const template = doT.template(
    `<div class="modalRoot">
    <div class="modal">
        <div class="modalTitle">{{=it.title}}</div>
        <div class="modalBody"></div>
    </div>
</div>`)

export abstract class Modal {
    private static modalPresent: boolean = false

    fullScreenDiv: Element
    bodyDiv: Element
    titleDiv: Element

    constructor(title?: string) {
        if (Modal.modalPresent) {
            throw 'Modal is already present'
        }
        let parser = new DOMParser()
        let modalHtml = template({ title: title ? '<h2>' + title + '</h2>' : '' })
        let tempDoc = parser.parseFromString(modalHtml, 'text/html')

        this.fullScreenDiv = tempDoc.querySelector('.modalRoot') !
        this.bodyDiv = tempDoc.querySelector('.modalBody') !
        this.titleDiv = tempDoc.querySelector('.modalTitle') !
    }

    createModal() {
        Modal.modalPresent = true
        this.setModalContent()
        document.body.appendChild(this.fullScreenDiv)
    }

    deleteModal() {
        Modal.modalPresent = false
        this.fullScreenDiv.remove()
    }

    protected abstract setModalContent(): void;

    protected addDefaultRejection(reject: Function) {
        Mousetrap.bind('escape', () => reject())
        this.fullScreenDiv.addEventListener('click', (event) => event.target == this.fullScreenDiv && reject())
    }
}