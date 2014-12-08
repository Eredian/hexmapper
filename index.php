<?php
require_once("generateCSS.php");
?>

<!DOCTYPE html>
<html>
<head>
    <script type="text/javascript" src="hexmapper.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <title>Hex Mapper</title>
</head>
<body>
	<div id="selectedInfo" class="hexcell"><div class="hexcell hexagon"></div><div id="selectedInfoDisplay" class="hexcell display"></div></div>
	<div id="hexmap">test</div>
    <ul id="selectorList">
        <?php
        outputhtml();
        ?>
        <li onclick="save()" style="cursor: pointer;">Save</li>
        <li onclick="load()" style="cursor: pointer;">Load</li>
        <li onclick="exportMap()" style="cursor: pointer;">Export</li>
        <li onclick="importMap()" style="cursor: pointer;">Import</li>
        <li><textarea id="mapData" rows="2" cols="2"></textarea></li>
    </ul>
</body>
</html>
