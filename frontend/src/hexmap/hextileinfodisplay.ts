import {HexTile} from './hextile';

export class HexTileInfoDisplay {
    tile: HexTile;
    displayRoot: HTMLDivElement = document.createElement("div");
    displayTitle: HTMLHeadingElement = document.createElement("h3");
    closeButton: HTMLButtonElement = document.createElement("button");
    contentTextArea: HTMLTextAreaElement = document.createElement("textarea");
    
    constructor() {
        this.displayRoot.id = "tileDisplay";
        
        this.displayTitle.textContent = this.tile.info.name;
        this.displayRoot.appendChild(this.displayTitle);
        
        this.closeButton.addEventListener("mouseup", () => this.destroy())
        this.displayRoot.appendChild(this.closeButton);
        
        this.contentTextArea.textContent = this.tile.info.description;
        this.displayRoot.appendChild(this.contentTextArea);
        
        document.body.appendChild(this.displayRoot);
    }
    
    destroy() {
        this.displayRoot.remove();
    }
    
}