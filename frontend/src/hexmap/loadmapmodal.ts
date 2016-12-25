import { Modal } from './modal';

export class LoadMapModal extends Modal {
    currentMapNames: string[];
    promise: Promise<string>;

    constructor(currentMapNames: string[]) {
        super("Load map");
        this.currentMapNames = currentMapNames;
    }

    async waitOnModal() {
        this.createModal();
        return this.promise;
    }

    setModalContent() {
        let description = document.createElement("p");
        description.textContent = "Choose a map name.";
        this.bodyDiv.appendChild(description);

        let form = document.createElement("form");
        let nameSelect = document.createElement("select");
        this.currentMapNames.forEach((mapName: string) => {
            let nameOption = document.createElement("option");
            nameOption.value = mapName;
            nameOption.text = mapName;
            nameSelect.appendChild(nameOption);
        });
        form.appendChild(nameSelect);

        let cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.type = "button";
        form.appendChild(cancelButton);
        let loadButton = document.createElement("button");
        loadButton.textContent = "Load";
        loadButton.type = "button";
        form.appendChild(loadButton);

        this.promise = new Promise((resolve, reject) => {
            loadButton.addEventListener("click", () => {
                resolve(nameSelect.value);
                this.deleteModal();
            });
            cancelButton.addEventListener("click", () => {
                reject();
                this.deleteModal();
            });
        });

        this.bodyDiv.appendChild(form);
    }
}