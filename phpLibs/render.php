<?php
print_r($argv);
include_once('router.php');

$router = new Router('../views/config.yaml');
$router->display('/top01');