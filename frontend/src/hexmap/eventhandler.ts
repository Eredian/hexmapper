import { HexMap } from './hexmap';

export class EventHandler {
    map: HexMap;

    constructor(hexmap: HexMap) {
        this.map = hexmap;

        this.addButtonListeners();
        this.addShortcuts();
    }

    addButtonListeners() {
        this.tryAddListener("zoomInButton", "mouseup", () => this.map.zoomIn());
        this.tryAddListener("zoomOutButton", "mouseup", () => this.map.zoomOut());
        this.tryAddListener("mapSaveButton", "mouseup", () => this.map.save());
        this.tryAddListener("mapLoadButton", "mouseup", () => this.map.load());

        this.tryAddListener("upButton", "mouseup", () => this.map.up());
        this.tryAddListener("downButton", "mouseup", () => this.map.down());
        this.tryAddListener("leftButton", "mouseup", () => this.map.left());
        this.tryAddListener("rightButton", "mouseup", () => this.map.right());
    }

    addShortcuts() {
        Mousetrap.bind('q', () => this.map.nextSelectedImage(false));
        Mousetrap.bind('a', () => this.map.nextSelectedImage(true));
        Mousetrap.bind('+', () => this.map.setBigPaint(true));
        Mousetrap.bind('-', () => this.map.setBigPaint(false));
        Mousetrap.bind('w', () => this.map.nextSelectedColor(false));
        Mousetrap.bind('s', () => this.map.nextSelectedColor(true));
        Mousetrap.bind('y', () => this.map.addColumn(false));
        Mousetrap.bind('o', () => this.map.addColumn(true));
        Mousetrap.bind('i', () => this.map.addRow(false));
        Mousetrap.bind('u', () => this.map.addRow(true));
    }

    handleClick(func: Function, e: MouseEvent) {
        if (e.button == 0) {
            func();
        }
    }

    tryAddListener(id: string, type: string, func: any) {
        let element = document.getElementById(id);
        if (element !== null) {
            element.addEventListener(type, (event: MouseEvent) => this.handleClick(func, event));
        } else {
            throw Error("Element with id " + id + " does not exist.");
        }
    }
}