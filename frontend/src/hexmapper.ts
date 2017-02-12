import {EventHandler} from './hexmap/eventhandler';
import {HexMap} from './hexmap/hexmap';

var map: HexMap;

document.addEventListener("touchstart", function (e: TouchEvent) {
    e.preventDefault();
    let touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        let event: MouseEvent = new MouseEvent("onmousedown", { clientX: touches[i].clientX, clientY: touches[i].clientY });
        event.initEvent('mousedown', true, false);
        e.target.dispatchEvent(event);
    }
});
document.addEventListener('touchend', function (e: TouchEvent) {
    e.preventDefault();
    let touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        /*var event: MouseEvent = new MouseEvent("onmouseup", {clientX:touches[i].clientX,clientY:touches[i].clientY});
        event.initEvent('mouseup', true, false);
        e.target.dispatchEvent(event);*/
        let event2: MouseEvent = new MouseEvent("onclick", { clientX: touches[i].clientX, clientY: touches[i].clientY });
        event2.initEvent('mouseup', true, false);
        setTimeout(function () { e.target.dispatchEvent(event2) }, 100);
    }
});
document.addEventListener("touchcancel", function (e: TouchEvent) { e.preventDefault(); }, false);
document.addEventListener("touchleave", function (e: TouchEvent) { e.preventDefault(); }, false);
document.addEventListener("touchmove", function (e: TouchEvent) {
    e.preventDefault();
    let touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        let event: MouseEvent = new MouseEvent("onmousemove", { clientX: touches[i].clientX, clientY: touches[i].clientY, button: 0, buttons: 1 });
        event.initEvent('mousemove', true, false);
        e.target.dispatchEvent(event);
    }
});

window.onload = function () {
    map = new HexMap();
    window.map = map;
    map.generateNewDefaultMap();
    map.resize(window.innerWidth, window.innerHeight, false);
    
    new EventHandler(map);

    window.addEventListener("resize", () => map.resize(window.innerWidth, window.innerHeight, true), false);

    map.generateNewDefaultMap();
    map.drawMap();
};
