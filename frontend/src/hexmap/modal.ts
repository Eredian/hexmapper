export abstract class Modal {
    title: string;
    fullScreenDiv: HTMLDivElement = document.createElement("div");
    mainDiv: HTMLDivElement = document.createElement("div");
    bodyDiv: HTMLDivElement = document.createElement("div");
    titleDiv: HTMLDivElement = document.createElement("div");

    constructor(title: string) {
        this.title = title;
    }

    createModal() {
        this.fullScreenDiv.className = "modalRoot";
        this.mainDiv.className = "modal";
        this.titleDiv.className = "modalTitle";
        this.bodyDiv.className = "modalBody";
        this.mainDiv.appendChild(this.titleDiv);
        this.mainDiv.appendChild(this.bodyDiv);
        this.fullScreenDiv.appendChild(this.mainDiv);
        this.setModalTitle();
        this.setModalContent();
        document.body.appendChild(this.fullScreenDiv);
    }

    deleteModal() {
        this.fullScreenDiv.remove();
    }

    setModalTitle() {
        let titleHeader = document.createElement("h2");
        titleHeader.innerText = this.title;
        this.titleDiv.appendChild(titleHeader);
    }
    protected abstract setModalContent(): void;
}