import { EventHandler } from './hexmap/eventhandler'
import { HexMap } from './hexmap/hexmap'

var map: HexMap

window.onload = function () {
    let canvas = document.getElementById('canvas')!
    canvas.addEventListener('touchstart', function (e: TouchEvent) {
        e.preventDefault()
        let touches = e.changedTouches

        for (var i = 0; i < touches.length; i++) {
            let event: MouseEvent = new MouseEvent('onmousedown', { clientX: touches[i].clientX, clientY: touches[i].clientY })
            event.initEvent('mousedown', true, false)
            e.target.dispatchEvent(event)
        }
    })
    canvas.addEventListener('touchend', function (e: TouchEvent) {
        e.preventDefault()
        let touches = e.changedTouches

        for (var i = 0; i < touches.length; i++) {
            /*var event: MouseEvent = new MouseEvent("onmouseup", {clientX:touches[i].clientX,clientY:touches[i].clientY});
            event.initEvent('mouseup', true, false);
            e.target.dispatchEvent(event);*/
            let event2: MouseEvent = new MouseEvent('onclick', { clientX: touches[i].clientX, clientY: touches[i].clientY })
            event2.initEvent('mouseup', true, false)
            setTimeout(function () { e.target.dispatchEvent(event2) }, 100)
        }
    })
    canvas.addEventListener('touchcancel', function (e: TouchEvent) { e.preventDefault() }, false)
    canvas.addEventListener('touchleave', function (e: TouchEvent) { e.preventDefault() }, false)
    canvas.addEventListener('touchmove', function (e: TouchEvent) {
        e.preventDefault()
        let touches = e.changedTouches

        for (var i = 0; i < touches.length; i++) {
            let event: MouseEvent = new MouseEvent('onmousemove', { clientX: touches[i].clientX, clientY: touches[i].clientY, button: 0, buttons: 1 })
            event.initEvent('mousemove', true, false)
            e.target.dispatchEvent(event)
        }
    }, true)

    document.getElementById('selectorListToggleButton')!.addEventListener('mouseup', () => {
        let classList = document.getElementById('selectorList')!.classList
        if (classList.contains('visible')) {
            classList.remove('visible')
        } else {
            classList.add('visible')
        }
    })

    map = new HexMap();
    (<any>window).map = map
    map.generateNewDefaultMap()
    map.resize(false)

    new EventHandler(map)

    window.addEventListener('resize', () => setTimeout(() => map.resize(true), 500), false)

    map.generateNewDefaultMap()
    map.drawMap()
}
