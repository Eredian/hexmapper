<?php

header('Content-type: application/json');

$indir = scandir("images");
$indir = array_diff($indir, array('.', '..', 'Thumbs.db'));
echo json_encode(array_values($indir));


?>