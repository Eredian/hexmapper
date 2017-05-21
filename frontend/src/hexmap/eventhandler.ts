import { HexMap } from './hexmap'
import { toolButtonsValues } from './toolswitcher'
import { Tool } from './enums/tool'

export class EventHandler {
    map: HexMap

    constructor(hexmap: HexMap) {
        this.map = hexmap

        this.addButtonListeners()
        this.addShortcuts()
    }

    addButtonListeners() {
        this.tryAddListener('zoomInButton', 'mouseup', () => this.map.zoomIn())
        this.tryAddListener('zoomOutButton', 'mouseup', () => this.map.zoomOut())
        this.tryAddListener('mapSaveButton', 'mouseup', () => this.map.save())
        this.tryAddListener('mapLoadButton', 'mouseup', () => this.map.load())
        this.tryAddListener('mapCreateButton', 'mouseup', () => this.map.create())
        this.tryAddListener('logInOrOutButton', 'mouseup', () => this.map.logInOrOut())
        this.tryAddListener('changePermissionsButton', 'mouseup', () => this.map.changePermissions())

        this.tryAddListener('upButton', 'mouseup', () => this.map.up())
        this.tryAddListener('downButton', 'mouseup', () => this.map.down())
        this.tryAddListener('leftButton', 'mouseup', () => this.map.left())
        this.tryAddListener('rightButton', 'mouseup', () => this.map.right())

        this.tryAddListener('toolButtons', 'mouseup', () => this.showOrHideToolSelectionButtons())
        toolButtonsValues.forEach((toolButtonValues, tool) => {
            let toolButtonId = toolButtonValues.id
            this.tryAddListener(toolButtonId, 'mouseup', () => this.map.switchToTool(tool))
        })
    }

    showOrHideToolSelectionButtons() {
        let classList = document.getElementById('selectionToolButtons') !.classList
        if (classList.contains('hidden')) {
            classList.remove('hidden')
        } else {
            classList.add('hidden')
        }
    }

    addShortcuts() {
        Mousetrap.bind('q', () => this.map.nextSelectedImage(false))
        Mousetrap.bind('a', () => this.map.nextSelectedImage(true))
        Mousetrap.bind('+', () => this.map.setBigPaint(true))
        Mousetrap.bind('-', () => this.map.setBigPaint(false))
        Mousetrap.bind('w', () => this.map.nextSelectedColor(false))
        Mousetrap.bind('s', () => this.map.nextSelectedColor(true))
        Mousetrap.bind('y', () => this.map.addColumn(false))
        Mousetrap.bind('o', () => this.map.addColumn(true))
        Mousetrap.bind('i', () => this.map.addRow(false))
        Mousetrap.bind('u', () => this.map.addRow(true))
        Mousetrap.bind('z', () => this.map.switchToTool(Tool.EYEDROPPER))
    }

    handleClick(func: Function, e: MouseEvent) {
        if (e.button == 0) {
            func()
        }
    }

    tryAddListener(id: string, type: string, func: any) {
        let element = document.getElementById(id)
        if (element !== null) {
            element.addEventListener(type, (event: MouseEvent) => this.handleClick(func, event))
        } else {
            throw Error('Element with id ' + id + ' does not exist.')
        }
    }
}