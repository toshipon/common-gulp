<?
class Asset {
	public static $assetPath = '';
	
	public static function js($path) {
		$jsPath = self::$assetPath.'js/'.$path;
		return "<script type=\"text/javascript\" src=\"${jsPath}\"></script>\n";
	}
	public static function css($path) {
		$cssPath = self::$assetPath.'css/'.$path;
		return "<link href=\"${cssPath}\" rel=\"stylesheet\" type=\"text/css\" media=\"all\">";
	}
	public static function img($src, $attr) {
		return sprintf(
			"<img src=\"%s\" alt=\"%s\" width=\"%s\" height=\"%s\"/>",
			self::$assetPath.'img/'.$src,
			$attr['alt'],
			$attr['width'],
			$attr['height']
		);
	}
	public static function get_file($path, $type) {
		return self::$assetPath.'img/'.$path;
	}
}