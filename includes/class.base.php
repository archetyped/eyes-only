<?php

require_once 'class.utilities.php';

/**
 * @package Eyes Only
 * @author Archetyped
 *
 */
class EOP_Base {

	/**
	 * Prefix for Cornerstone-related data (attributes, DB tables, etc.)
	 * @var string
	 */
	var $prefix = 'eop';

	/**
	 * Utilities instance
	 * @var EOP_Utilities
	 */
	var $util;

	/**
	 * Constructor
	 */
	function __construct() {
		$this->util = new EOP_Utilities();
	}

	function register_hooks() {
		//Activation
		$func_activate = 'activate';
		if ( method_exists($this, $func_activate) )
			register_activation_hook($this->util->get_plugin_base_file(), $this->m($func_activate));
		//Deactivation
		$func_deactivate = 'deactivate';
		if ( method_exists($this, $func_deactivate) )
			register_deactivation_hook($this->util->get_plugin_base_file(), $this->m($func_deactivate));
	}

	/**
	 * Returns callback to instance method
	 * @param string $method Method name
	 * @return array Callback array
	 */
	function &m($method) {
		return $this->util->m($this, $method);
	}

	/**
	 * Retrieve class prefix (with separator if set)
	 * @param bool|string $sep Separator to append to class prefix (Default: no separator)
	 * @return string Class prefix
	 */
	function get_prefix($sep = false) {
		$sep = ( is_string($sep) ) ? $sep : '';
		$prefix = ( !empty($this->prefix) ) ? $this->prefix . $sep : '';
		return $prefix;
	}

	/**
	 * Prepend plugin prefix to some text
	 * @param string $text Text to add to prefix
	 * @param string $sep Text used to separate prefix and text
	 * @return string Text with prefix prepended
	 */
	function add_prefix($text = '', $sep = '_') {
		if ( is_array($text) )
			$text = implode($sep, $text);
		return $this->get_prefix($sep) . $text;
	}
}

?>