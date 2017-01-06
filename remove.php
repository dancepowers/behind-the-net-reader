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

$item = $_POST['item'];

if (isset($data->menu->{$item})) {
	unset($data->menu->{$item});
	file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT));
	echo json_encode($data, JSON_PRETTY_PRINT);
} else {
	
}

?>