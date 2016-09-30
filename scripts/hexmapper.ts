var map;

document.addEventListener("touchstart", function (e: TouchEvent) {
    e.preventDefault();
    var touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var event: MouseEvent = new MouseEvent("onmousedown", { clientX: touches[i].clientX, clientY: touches[i].clientY });
        event.initEvent('mousedown', true, false);
        e.target.dispatchEvent(event);
    }
});
document.addEventListener('touchend', function (e: TouchEvent) {
    e.preventDefault();
    var touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        /*var event: MouseEvent = new MouseEvent("onmouseup", {clientX:touches[i].clientX,clientY:touches[i].clientY});
        event.initEvent('mouseup', true, false);
        e.target.dispatchEvent(event);*/
        var event2: MouseEvent = new MouseEvent("onclick", { clientX: touches[i].clientX, clientY: touches[i].clientY });
        event2.initEvent('mouseup', true, false);
        setTimeout(function() {e.target.dispatchEvent(event2)}, 100);
    }
});
document.addEventListener("touchcancel", function(e: TouchEvent) {e.preventDefault();}, false);
document.addEventListener("touchleave", function(e: TouchEvent) {e.preventDefault();}, false);
document.addEventListener("touchmove", function (e: TouchEvent) {
    e.preventDefault();
    var touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var event: MouseEvent = new MouseEvent("onmousemove", { clientX: touches[i].clientX, clientY: touches[i].clientY, button: 0, buttons: 1 });
        event.initEvent('mousemove', true, false);
        e.target.dispatchEvent(event);
    }
});


window.onload = function () {
    map = new HexMap();
    map.resize(window.innerWidth, window.innerHeight, false);

    document.getElementById("zoomInButton").addEventListener("mouseup", () => map.zoomIn());
    document.getElementById("zoomOutButton").addEventListener("mouseup", () => map.zoomOut());
    document.getElementById("mapSaveButton").addEventListener("mouseup", () => map.save());
    document.getElementById("mapLoadButton").addEventListener("mouseup", () => map.load());

    document.getElementById("upButton").addEventListener("mouseup", () => map.up());
    document.getElementById("downButton").addEventListener("mouseup", () => map.down());
    document.getElementById("leftButton").addEventListener("mouseup", () => map.left());
    document.getElementById("rightButton").addEventListener("mouseup", () => map.right());

    window.addEventListener("resize", () => map.resize(window.innerWidth, window.innerHeight, true), false);

    map.generateNewDefaultMap();
    map.drawMap();

    Mousetrap.bind('q', function () { map.nextSelectedImage(false); });
    Mousetrap.bind('a', function () { map.nextSelectedImage(true); });
    Mousetrap.bind('+', function () { map.setBigPaint(true); });
    Mousetrap.bind('-', function () { map.setBigPaint(false); });
    Mousetrap.bind('w', function () { map.nextSelectedColor(false); });
    Mousetrap.bind('s', function () { map.nextSelectedColor(true); });
    Mousetrap.bind('y', function () { map.addColumn(false); });
}


