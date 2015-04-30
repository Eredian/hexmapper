<?php
if (isset($_GET['filename']) && isset($_POST['data']))
{
    header('Content-type: text/plain');
    $filename = $_GET['filename'];
    if (ctype_alnum($filename))
    {
		echo file_put_contents("./maps/".$filename.".txt", $_POST['data']);
    } else {
		echo "Filename must be alphanumeric. Received : "+$filename;
	}
} else {
	echo "missing data or filename";
}
?>