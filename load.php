<?php
if (isset($_GET['filename']))
{
    header('Content-type: text/plain');
    $filename = $_GET['filename'];
    if (ctype_alnum($filename))
    {
		echo file_get_contents("./maps/".$filename.".txt");
    } else {
		echo "Filename must be alphanumeric. Received : "+$filename;
	}
}


?>