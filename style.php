<?php
$files = scandir("hexes");
foreach($files as $file) {
  if(endsWith($file, ".png")) {
    $fileSansExtension = substr($file, 0, -4);
    echo ".$fileSansExtension {
  background-image: url(hexes/$file), url('images/perfectHex.png');
}\n";
  }
}


function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}
?>
