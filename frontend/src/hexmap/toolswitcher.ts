import * as doT from 'dot'
import { Configuration } from './configuration'
import { ToolButtonValues } from './modals/toolbuttonvalues'

export enum Tool {
    USE,
    DRAW_IMAGE,
    DRAW_COLOR,
    DRAW_IMAGE_COLOR,
    EXPLORE
}

export const toolButtonsValues = new Map<Tool, ToolButtonValues>([
    [Tool.USE, new ToolButtonValues('useToolButton', 'fa-mouse-pointer')],
    [Tool.DRAW_IMAGE, new ToolButtonValues('imageToolButton', 'fa-pencil', ['fa-home'])],
    [Tool.DRAW_COLOR, new ToolButtonValues('colorToolButton', 'fa-pencil', ['fa-tint'])],
    [Tool.DRAW_IMAGE_COLOR, new ToolButtonValues('colorImageToolButton', 'fa-pencil', ['fa-tint', 'fa-home'])],
    [Tool.EXPLORE, new ToolButtonValues('exploreToolButton', 'fa-pencil', ['fa-eye'])]])

const template = doT.template(
    `<i id="currentToolButton" class="fa fa-fw {{=it.mainClass}} fa-bigx selected overlaid">
        {{~it.cornerClasses :value:index}}
            <i class="fa fa-fw {{=value}}"></i>
        {{~}}
    </i>`)

export class ToolSwitcher {
    currentTool: Tool
    configuration: Configuration

    constructor(configuration: Configuration) {
        this.configuration = configuration
        this.currentTool = Tool.USE
        this.configuration.currentTool = this.currentTool
    }

    switchToTool(tool: Tool) {
        document.getElementById(toolButtonsValues.get(this.currentTool) !.id) !.classList.remove('selected')
        this.currentTool = tool
        document.getElementById(toolButtonsValues.get(this.currentTool) !.id) !.classList.add('selected')

        document.getElementById('currentToolButton') !.outerHTML = template((toolButtonsValues.get(this.currentTool)))

        this.configuration.currentTool = this.currentTool

        //document.getElementById('selectionToolButtons') !.classList.add('hidden')
    }
}