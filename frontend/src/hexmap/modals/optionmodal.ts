import { Modal } from './modal';

export class OptionModal extends Modal {
    options: Map<string, string>
    message: string;

    constructor(title: string, message: string, options: Map<string, string>) {
        super(title);
        this.options = options;
        this.message = message;
    }

    setModalContent() {
        let description = document.createElement("p");
        description.textContent = this.message;
        this.bodyDiv.appendChild(description);

        let form = document.createElement("form");
        this.options.forEach((optionName: string, optionKey: string) => {
            let button = document.createElement("button");
            button.name = optionKey;
            button.textContent = optionName;
            button.type = "button";
            button.onclick = () => this.deleteModal();
            form.appendChild(button);
        });
        this.bodyDiv.appendChild(form);
    }
}