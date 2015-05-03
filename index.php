<?php
require_once("generateCSS.php");
?>

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="viewport" content="width=device-width">
    <script type="text/javascript" src="hexmapper.js"></script>
    <link rel="stylesheet" href="css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <title>Hex Mapper</title>
</head>
<body>
	<canvas id="canvas" width="1024" height="768"></canvas>
    <ul id="selectorList">
        <li id="mapSaveButton" style="cursor: pointer;"><i class="fa fa-floppy-o"></i></li>
        <li id="mapLoadButton" style="cursor: pointer;"><i class="fa fa-download"></i></li>
        <li><textarea id="mapData" rows="2" cols="2"></textarea></li>
    </ul>
</body>
</html>
