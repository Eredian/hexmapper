export class ToolButtonValues {
    id: string
    mainClass: string
    cornerClasses: string[]

    constructor(id: string, mainClass: string, cornerClasses?: string[]) {
        this.id = id
        this.mainClass = mainClass
        if (cornerClasses) {
            this.cornerClasses = cornerClasses
        }
    }
}