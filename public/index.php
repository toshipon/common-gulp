<?php
if (preg_match('/\.(?:css|js|png|jpg|jpeg|gif)$/', $_SERVER['REQUEST_URI'])) {
	return false;
}

include_once('../node_modules/common-gulp/phpLibs/router.php');

$router = new Router('../views/config.yaml');
$router->display($_SERVER['REQUEST_URI']);