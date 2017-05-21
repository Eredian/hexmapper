import * as doT from 'dot'
import { configuration } from './configuration'
import { Tool } from './enums/tool'
import { ToolButtonValues } from './models/toolbuttonvalues'

export const toolButtonsValues = new Map<Tool, ToolButtonValues>([
    [Tool.USE, new ToolButtonValues('useToolButton', 'fa-mouse-pointer')],
    [Tool.DRAW_IMAGE, new ToolButtonValues('imageToolButton', 'fa-pencil', ['fa-home'])],
    [Tool.DRAW_COLOR, new ToolButtonValues('colorToolButton', 'fa-pencil', ['fa-tint'])],
    [Tool.DRAW_IMAGE_COLOR, new ToolButtonValues('colorImageToolButton', 'fa-pencil', ['fa-tint', 'fa-home'])],
    [Tool.EXPLORE, new ToolButtonValues('exploreToolButton', 'fa-pencil', ['fa-eye'])],
    [Tool.EYEDROPPER, new ToolButtonValues('eyedropperButton', 'fa-eyedropper')]])

const template = doT.template(
    `<i id="currentToolButton" class="fa fa-fw {{=it.mainClass}} fa-bigx selected overlaid">
        {{~it.cornerClasses :value:index}}
            <i class="fa fa-fw {{=value}}"></i>
        {{~}}
    </i>`)

export class ToolSwitcher {
    currentTool: Tool
    currentlyExploring: boolean = false
    currentlyConcealing: boolean = false

    constructor() {
        this.currentTool = Tool.USE
        configuration.currentTool = this.currentTool
    }

    switchToTool(tool: Tool) {
        document.getElementById(toolButtonsValues.get(this.currentTool)!.id)!.classList.remove('selected')
        this.currentTool = tool
        document.getElementById(toolButtonsValues.get(this.currentTool)!.id)!.classList.add('selected')

        document.getElementById('currentToolButton')!.outerHTML = template((toolButtonsValues.get(this.currentTool)))

        configuration.currentTool = this.currentTool
    }
}