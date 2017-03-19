export class MapPermissions {
    owners: Set<string>
    users: Set<string>

    constructor(owner: string) {
        this.owners = new Set([owner])
        this.users = new Set([owner])
    }

    canEdit(user: string) {
        return this.owners.has(user)
    }

    toJSON() {
        return new MapPermissionsForExport(this)
    }

    static fromJSON(mapPermissionsForExport: MapPermissionsForExport) {
        let object: MapPermissions = Object.create(MapPermissions.prototype)
        object.users = new Set(mapPermissionsForExport.users)
        object.owners = new Set(mapPermissionsForExport.owners)
        return object
    }
}

export class MapPermissionsForExport {
    owners: string[]
    users: string[]

    constructor(mapPermissions: MapPermissions) {
        this.owners = [...mapPermissions.owners]
        this.users = [...mapPermissions.users]
    }
}