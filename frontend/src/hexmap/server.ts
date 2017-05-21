import { MapData } from './models/mapdata'

export let currentUser = ''

export class Server {

    private backEndPath: string = `http://${window.location.hostname}:8081/`
    private authPath: string = this.backEndPath + 'auth/'
    private mapPath: string = this.backEndPath + 'map/'

    private jwtToken: string
    private name: string
    private email: string
    private photoUrl: string

    constructor() {
        this.loadAccount()
        if (this.jwtToken) {
            this.displayLoggedIn()
        }
    }

    async getMapNames() {
        let jsonResponse = await this.call(this.mapPath)
        let mapNames: string[] = JSON.parse(await jsonResponse.text())
        return mapNames
    }

    async getMap(name: string) {
        let jsonResponse = await this.call(this.mapPath + name)
        let json = await jsonResponse.text()

        return MapData.fromJSON(json)
    }

    async putMap(name: string, mapData: MapData) {
        let headers = new Headers()
        headers.append('Accept', 'application/json')
        headers.append('Content-Type', 'application/json')
        let response = this.call(this.mapPath + name, 'POST', headers, JSON.stringify(mapData))

        console.log(response)
    }

    async logInOrOut() {
        if (this.jwtToken) {
            this.jwtToken = ''
            this.name = ''
            this.email = ''
            currentUser = ''
            this.photoUrl = ''
            this.removeAccount()
            this.displayLoggedOut()
        } else {
            window.addEventListener('message', (event) => { return this.handleMessage(event) })
            var newWindow = window.open(this.authPath + `authorize?redirect=http://${window.location.hostname}:8080/frontend`, 'name', 'height=600,width=450')
            if (window.focus) {
                newWindow.focus()
            }
        }
    }

    private async call(url: string, method?: string, headers?: Headers, body?: string) {
        if (!headers) {
            headers = new Headers
        }
        let parameters: RequestInit = {}
        if (method) {
            parameters.method = method
        }
        if (body) {
            parameters.body = body
        }
        headers.append('Authorization', 'Bearer ' + this.jwtToken)
        parameters.headers = headers

        let response = await fetch(url, parameters)

        if (response.status == 401) {
            this.displayLoggedOut()
            this.removeAccount()
            throw new Error('Call failed becaused authentication failed.')
        }
        return response
    }

    private handleMessage(event: MessageEvent) {
        event.target.removeEventListener(event.type, this.handleMessage)
        let message = JSON.parse(event.data)
        this.jwtToken = message.token
        this.name = message.name
        this.email = message.email
        currentUser = message.email
        this.photoUrl = message.photo
        this.storeAccount()
        this.displayLoggedIn()
    }

    private displayLoggedIn() {
        let button = document.querySelector('#logInOrOutButton i') !
        button.classList.remove('fa-sign-in')
        button.classList.add('fa-sign-out')
    }

    private displayLoggedOut() {
        let button = document.querySelector('#logInOrOutButton i') !
        button.classList.remove('fa-sign-out')
        button.classList.add('fa-sign-in')
    }

    private storeAccount() {
        localStorage.setItem('jwtToken', this.jwtToken)
        localStorage.setItem('name', this.name)
        localStorage.setItem('email', this.email)
        localStorage.setItem('photoUrl', this.photoUrl)
    }

    private loadAccount() {
        this.jwtToken = localStorage.getItem('jwtToken') || ''
        this.name = localStorage.getItem('name') || ''
        this.email = localStorage.getItem('email') || ''
        currentUser = this.email
        this.photoUrl = localStorage.getItem('photoUrl') || ''
    }

    private removeAccount() {
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('name')
        localStorage.removeItem('email')
        localStorage.removeItem('photoUrl')
    }
}