<?php


$dataDir = dirname(__FILE__) . '/data';
$backupDir = dirname(__FILE__) . '/data/backup';

if (!is_dir($dataDir)) {
	mkdir($dataDir);
}

if (!is_dir($backupDir)) {
	mkdir($backupDir);
}

$filepath = $dataDir . '/info.json';
$backuppath = $backupDir . '/' . time() . '_info.json';
$backup = copy($filepath, $backuppath);


$data = json_decode(file_get_contents($filepath));

$title = $_POST['title'];
$url = $_POST['url'];

if ($title != '' && $url != '' && filter_var($url, FILTER_VALIDATE_URL)) {
	$data->menu->{$title} = $url;
	file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT));

	echo json_encode($data, JSON_PRETTY_PRINT);
} else {
	
}

?>