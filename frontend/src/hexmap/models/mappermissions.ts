import { currentUser } from '../server'

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

    currentUserCanEdit() {
        return this.owners.has(currentUser)
    }

    toJSON() {
        let permissionsToJson: MapPermissionsForExport[] = []
        this.owners.forEach((owner) => { permissionsToJson.push(new MapPermissionsForExport(owner, 'owner')) })
        this.users.forEach((user) => { permissionsToJson.push(new MapPermissionsForExport(user, 'user')) })
        return permissionsToJson
    }

    static fromJSON(mapPermissionsForExport: MapPermissionsForExport[]) {
        let object: MapPermissions = Object.create(MapPermissions.prototype)
        object.owners = new Set()
        object.users = new Set()
        mapPermissionsForExport.forEach((permission) => {
            if (permission.type == 'owner') {
                object.owners.add(permission.email)
            } else {
                object.users.add(permission.email)
            }
        })
        return object
    }
}

export class MapPermissionsForExport {
    email: string
    type: string

    constructor(email: string, type: string) {
        this.email = email
        this.type = type
    }
}