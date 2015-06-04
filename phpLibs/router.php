<?
if (preg_match('/\.(?:css|js|png|jpg|jpeg|gif)$/', $_SERVER['REQUEST_URI'])) {
	return false;
}
include('Asset.php');
include('Spyc.php');

class Router {
	private $config;
	private $data = [];
	private $viewPath;
	
	function __construct($configPath) {
		$this->config = Spyc::YAMLLoad($configPath);
		Asset::$assetPath = $this->config['assetsPath'];
		$this->viewPath = $this->config['viewRoot'];
	}
	
	private function setComponent($components) {
		foreach ($components as $name => $path) {
			$this->setData($name, $this->getView($path));
		}
	}
	
	private function setData($name, $value) {
		$this->data[$name] = $value;
	}
	
	/**
	 * @param $type
	 * @param $pageConfig
	 */
	private function setContent($type, $pageConfig) {
		if (isset($type)) {
			if ($type === 'top') {
				$this->setData('top', $this->getView($pageConfig['view']));
			} else if ($type === 'regist') {
				$this->setData('regist', $this->getView($pageConfig['view']));
			}
		} else {
			$this->setData('content', $this->getView($pageConfig['view']));
		}
	}
	
	private function mergeData($pageConfig) {
		$commonData = isset($this->config['common']['data']) ? $this->config['common']['data'] : [];
		$pageData = isset($pageConfig['data']) ? $pageConfig['data'] : [];
		$this->data = array_merge($commonData, $pageData, $this->data);
	}
	
	private function getLayoutPath($pageConfig, $config) {
		return isset($pageConfig['layout']) ? $pageConfig['layout'] : $config['common']['layout'];
	}
	
	/**
	 * @param $uri
	 */
	public function display($uri) {
		$pages = $this->config['pages'];
		
		if ($uri === '/') {
			$paths = array_keys($pages);
			include('index.html');
			return;
		}
		if (!isset($pages[$uri])) {
			echo 'page not found.';
			return;
		}
		
		$pageConfig = $pages[$uri];
		$this->data = [];
		
		$this->setComponent($this->config['components']);
		$this->setContent($pageConfig['type'], $pageConfig);
		
		$this->mergeData($pageConfig);
		
		$path = $this->getLayoutPath($pageConfig, $this->config);
		
		extract($this->data);
		include($this->viewPath.$path);
	}
	
	/**
	 * @param $file
	 * @return string
	 */
	private function getView($file){
		ob_start();
		require($this->viewPath.$file);
		$view = ob_get_contents();
		ob_end_clean();
		return $view;
	}
}