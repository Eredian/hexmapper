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

function handleClick(func: Function, e: MouseEvent) {
    if (e.button == 0) {
        func();
    }
}

function tryAddListener(id: string, type: string, func: any) {
    let element = document.getElementById(id);
    if (element !== null) {
        element.addEventListener(type, func);
    } else {
        throw Error("Element with id " + id + " does not exist.");
    }
}

window.onload = function () {
    map = new HexMap();
    map.resize(window.innerWidth, window.innerHeight, false);

    tryAddListener("zoomInButton", "mouseup", (e: MouseEvent) => handleClick(() => map.zoomIn(), e));
    tryAddListener("zoomOutButton", "mouseup", () => map.zoomOut());
    tryAddListener("mapSaveButton", "mouseup", () => map.save());
    tryAddListener("mapLoadButton", "mouseup", () => map.load());

    tryAddListener("upButton", "mouseup", () => map.up());
    tryAddListener("downButton", "mouseup", () => map.down());
    tryAddListener("leftButton", "mouseup", () => map.left());
    tryAddListener("rightButton", "mouseup", () => map.right());

    window.addEventListener("resize", () => map.resize(window.innerWidth, window.innerHeight, true), false);

    window.addEventListener("orientationchange", function () {
        // Announce the new orientation number
        alert(window.orientation);
    }, false);

    map.generateNewDefaultMap();
    map.drawMap();

    Mousetrap.bind('q', function () { map.nextSelectedImage(false); });
    Mousetrap.bind('a', function () { map.nextSelectedImage(true); });
    Mousetrap.bind('+', function () { map.setBigPaint(true); });
    Mousetrap.bind('-', function () { map.setBigPaint(false); });
    Mousetrap.bind('w', function () { map.nextSelectedColor(false); });
    Mousetrap.bind('s', function () { map.nextSelectedColor(true); });
    Mousetrap.bind('y', function () { map.addColumn(false); });
};


