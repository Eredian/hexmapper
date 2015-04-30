<?php

function outputcss() {
  $files = scandir("hexes");
  foreach($files as $file) {
    if(endsWith($file, ".png")) {
      $fileSansExtension = substr($file, 0, -4);
      echo ".$fileSansExtension {
    background-image: url(hexes/$file), url('images/perfectHex.png');
  }\n";
    }
  }
}

function outputhtml() {
  $files = scandir("hexes");
  foreach($files as $file) {
    if(endsWith($file, ".png")) {
      $fileSansExtension = substr($file, 0, -4);
      echo "<li onClick='selectHex(\"$fileSansExtension\", null )' class='$fileSansExtension'></li>";
    }
  }
  echo "<li onClick='selectHex(\"nothing\", \"cavernGroundColor\")'></li>";
  echo "<li onClick='selectHex(\"nothing\", \"murkyWaterColor\")'class='nothing murkyWaterColor'></li>";
  echo "<li onClick='selectHex(\"nothing\", \"swampRiverColor\")'class='nothing swampRiverColor'></li>";
  echo "<li onClick='selectHex(\"nothing\", \"lavaColor\")'class='nothing lavaColor'></li>";
  echo "<li onClick='selectHex(\"nothing\", \"nothingColor\")' class='nothing nothingColor'></li>";
}





function endsWith($haystack, $needle) {
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}

function sanitizeForFilename($string) {
    $bad = array_merge(
            array_map('chr', range(0,31)),
            array("<", ">", ":", '"', "/", "\\", "|", "?", "*", "."));
    return str_replace($bad, "", $string);
}

?>