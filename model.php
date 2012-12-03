<?php 

require_once 'includes/class.base.php';
require_once 'includes/class.options.php';

/**
 * @package Eyes Only
 * @author Archetyped
 *
 */
class EyesOnly extends EOP_Base {
	
	/**
	 * Redacted HTML class
	 * @var string
	 */
	var $class_redacted = 'redacted';
	
	/**
	 * Admin settings page
	 * @var string
	 */
	var $admin_settings = 'options';
	
	/**
	 * Admin page hookname
	 * @var string
	 */
	var $admin_page = '';
	
	/**
	 * Key for automatic redactions option
	 * @var string
	 */
	var $opt_autos = 'auto';
	
	/**
	 * Default config options
	 * @var array
	 */
	var $config = array(
		'add_css'	=> array('default' => true, 'label' => 'Use default styling for redacted text')
	);
	
	/**
	 * AJAX Action for automatic redactions
	 * @var string
	 */
	var $action_autos = 'autos_modify';
	
	/**
	 * Key for actual action being performed via AJAX request
	 * @var string
	 */
	var $action_autos_real = 'action';
	
	/**
	 * Plugin options
	 * @var EOP_Options
	 */
	var $options = null;
	
	/**
	 * Path to admin contextual help file
	 * @var string
	 */
	var $file_admin_help = 'resources/admin_help.html';
	
	/*-** Initialization **-*/

	function EyesOnly() {
		$this->__construct();
	}

	function __construct() {
		parent::__construct();
		$this->admin_settings = $this->add_prefix($this->admin_settings);
		$this->action_autos = $this->add_prefix($this->action_autos);
		$this->action_autos_real = $this->add_prefix($this->action_autos_real);
		$this->options =& new EOP_Options($this->config);
		$this->register_hooks();
	}
	
	function register_hooks() {
		/* Admin */
		add_action('admin_menu', $this->m('admin_menu'));
		add_action('admin_enqueue_scripts', $this->m('admin_enqueue_scripts'));
		add_filter('plugin_action_links_' . $this->util->get_plugin_base_name(), $this->m('admin_plugin_action_links'), 10, 4);
		//Admin AJAX
		add_action('wp_ajax_' . $this->add_prefix('autos_modify'), $this->m('admin_autos_modify'));
		//HTML Editor
		add_action('admin_enqueue_scripts', $this->m('admin_post_quicktags'));
		//TinyMCE
		add_filter('mce_buttons', $this->m('mce_buttons'));
		add_filter('mce_external_plugins', $this->m('mce_external_plugins'));
		//Shortcode
		$this->sc_activate();
		
		/* Content */
		
		//Automatic redactions
		add_filter('the_content', $this->m('autos_replace'), 20);
		
		//CSS
		add_action('wp_head', $this->m('add_style'));
	}
	
	/*-** Processors **-*/
	
	/**
	 * Redact text according to arguments
	 * @param string $txt Text to redact
	 * @param array $args Arguments
	 * @return string Redacted text
	 */
	function redact($txt, $args = array()) {
		$ret = '<span class="' . $this->class_redacted . '">REDACTED</span>';
		return $ret;
	}
	
	/**
	 * Replaces user-defined text in supplied content
	 * @param string $content Post content
	 * @return string Content with text replaced
	 */
	function replace($content) {
		$ret = $content;
		return $ret;
	}
	
	/*-** Shortcodes **-*/
	
	/**
	 * Shortcode activation
	 * @return void
	 */
	function sc_activate() {
		add_shortcode("redact", $this->m('sc_redact'));
	}
	
	/**
	 * Redact Shortcode
	 * Redacts text wrapped in shortcode
	 * @return string Redacted text
	 */
	function sc_redact($atts, $content = null) {
		$ret = $content;
		if ( !is_user_logged_in() ) {
			$defaults = array();
			
			$args = shortcode_atts($defaults, $atts);
			$ret = $this->redact($content, $args);
		}
		return $ret;
	}
	
	/*-** Content **-*/
	
	/**
	 * Scans content for user-defined text to automatically replace
	 * @param string $content Content to scan and modify
	 * @return string Modified content
	 */
	function autos_replace($content = '') {
		//Only apply for users without sufficient permissions
		if ( !is_user_logged_in() ) {
			$autos = $this->get_auto_redactions();
			//Check content for auto redacted text
			foreach ( $autos as $auto ) {
				if ( strpos($content, $auto['text']) === false )
					continue;
				$content = str_replace($auto['text'], $auto['data'], $content);
			}
		}
		return $content;
	}
	
	/**
	 * Output CSS styles to page
	 */
	function add_style() {
		if ( $this->options->get('add_css') )
			echo $this->util->build_stylesheet_element($this->util->get_file_url('/css/style.css'));
	}
	
	/*-** Admin **-*/
	
	/**
	 * Adds custom links below plugin on plugin listing page
	 * @param $actions
	 * @param $plugin_file
	 * @param $plugin_data
	 * @param $context
	 */
	function admin_plugin_action_links($actions, $plugin_file, $plugin_data, $context) {
		//Add link to settings (only if active)
		if ( is_plugin_active($this->util->get_plugin_base_name()) ) {
			$settings = __('Settings');
			$settings_url = add_query_arg('page', $this->admin_settings, admin_url('options-general.php'));
			array_unshift($actions, $this->util->build_html_element(array('tag' => 'a', 'attributes' => array('href' => $settings_url, 'title' => $settings), 'content' => $settings)));
		}
		return $actions;
	}
	
	/**
	 * Add CSS file to admin page
	 */
	function admin_enqueue_scripts() {
		if ( is_admin() && isset($_REQUEST['page']) && $this->admin_settings == $_REQUEST['page']) {
			$hdl_script = $this->add_prefix('script');
			$hdl_admin = $this->add_prefix('admin_script');
			$hdl_style = $this->add_prefix('admin_styles');
			wp_enqueue_script($hdl_script, $this->util->get_file_url('js/eop.js'), array('jquery'));
			wp_enqueue_script($hdl_admin, $this->util->get_file_url('js/admin.js'), array('jquery', $hdl_script));
			wp_enqueue_style($hdl_style, $this->util->get_file_url('css/admin.css'));
		}
	}
	
	/**
	 * Add menu item to admin nav
	 */
	function admin_menu() {
		$title = __('Eyes Only');
		$this->page = $p = $this->util->add_submenu_page('options-general.php', $title, $title, 'manage_options', $this->admin_settings, $this->m('admin_page'), 6);
		add_action("admin_head-$p", $this->m('admin_help'));
	}
	
	/**
	 * Add contextual help to admin page
	 */
	function admin_help() {
		$help = file_get_contents($this->util->normalize_path(dirname(__FILE__), $this->file_admin_help));
		add_contextual_help($this->page, $help);
	}
	
	/**
	 * Process AJAX modification to automatic redactions from admin page
	 * @return string Response to client
	 */
	function admin_autos_modify() {
		$ret = array();
		$found = false;
		//Validate
		if ( is_admin() && is_user_logged_in() && check_ajax_referer($this->action_autos) ) {
			//Process request
			if ( isset($_POST['orig']) && !empty($_POST['orig']) ) {
				$orig = $_POST['orig'];
				$autos = $this->get_auto_redactions();
				$id = ( isset($_POST['id']) ) ? $_POST['id'] : -1;
				$ret['id'] = $id;
				switch ( $_POST[$this->action_autos_real] ) {
					//Delete item
					case 'delete' :
						if ( isset($autos[$id]) ) {
							$found = true;
							unset($autos[$id]);
						}
						break;
					//Update/Create Item
					default : 
						//Get values
						$repl = ( isset($_POST['repl']) ) ? $_POST['repl'] : '';
						$val = array('text' => $orig, 'data' => $repl);
						//Check for existing item (modify)
						if ( isset($autos[$id]) ) {
							$autos[$id] = $val;
						} else {
							//Add new item if item does not yet exist
							$autos[] = $val;
							end($autos);
							$ret['new_id'] = key($autos); 
						}
						$found = true;
						break;
				}
				//Save updated data
				if ( $found ) {
					$this->save_auto_redactions($autos);
				}
			}
		}
		//Output response and end processing
		$ret['success'] = $found;
		echo json_encode($ret);
		exit;
	}
	
	/**
	 * Adds hidden fields to admin page
	 */
	function admin_autos_fields() {
		wp_nonce_field($this->action_autos);
		?>
		<input type="hidden" name="<?php echo $this->add_prefix('action'); ?>" id="<?php echo $this->add_prefix('action'); ?>" value="<?php echo esc_attr(admin_url('admin-ajax.php')); ?>" />
		<input type="hidden" name="<?php echo $this->add_prefix('action_real'); ?>" id="<?php echo $this->add_prefix('action_real'); ?>" value="<?php echo $this->action_autos_real; ?>" />
		<?php
	}
	
	/**
	 * Output content for admin page
	 */
	function admin_page() {
		global $title;
		$this->options->handle_form();
		?>
		<div class="wrap">
			<?php screen_icon(); ?>
			<h2><?php esc_html_e($title); ?></h2>
			<h3><?php _e('Automatic Redactions'); ?> <a id="<?php echo esc_attr($this->add_prefix('add_new')); ?>" href="#" class="button thickbox" title="<?php esc_attr_e('Add Auto-Redactor'); ?>"><?php echo esc_html_x('Add new', 'file')?></a></h3>
			<?php $this->admin_autos_fields(); ?>
			<!-- Auto redactors table -->
			<table id="<?php echo $this->add_prefix('autos'); ?>" class="widefat fixed" cellspacing="0">
				<thead>
					<tr>
						<th scope="col"><?php _e('Text'); ?></th>
						<th scope="col"><?php _e('Replacement'); ?></th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<th scope="col"><?php _e('Text'); ?></th>
						<th scope="col"><?php _e('Replacement'); ?></th>
					</tr>
				</tfoot>
				<tbody>
				<tr id="<?php echo esc_attr($this->add_prefix('inline_add')); ?>" class="inline-edit-row quick-edit-row-post">
					<td colspan="2">
						<h4 class="form_title">Add New</h4>
						<fieldset class="inline-edit-col-left">
							<div class="inline-edit-col">
								<label>
									<span class="title">Text</span>
									<span class="input-text-wrap"><input class="orig_text" type="text" /></span>
								</label>
							</div>
						</fieldset>
						<fieldset class="inline-edit-col-left">
							<div class="inline-edit-col">
								<label>
									<span class="title">Replacement</span>
									<span class="input-text-wrap"><input class="repl_text" type="text" /></span>
								</label>
							</div>
						</fieldset>
						<p class="submit inline-edit-save">
							<a class="button-secondary cancel alignleft" title="Cancel" href="#">Cancel</a>
							<input type="submit" id="<?php echo esc_attr($this->add_prefix('add_save')); ?>" name="<?php echo esc_attr($this->add_prefix('add_save')); ?>" class="button-primary save alignright" value="Add" />
							<br class="clear" />
						</p>
					</td>
				</tr>
				<?php
					$autos = $this->get_auto_redactions();
					$show_status = true;
					//Build rows
					if ( count($autos) ) {
						$show_status = false;
						foreach ( $autos as $id => $redaction ) { 
							$redaction['class'] = $rowclass = 'alternate' == $rowclass ? '' : 'alternate';
							$redaction['id'] = $id;
							$this->autos_row($redaction);
						}
					} else {
						//Make hidden row for template
						$this->autos_row();
					}
					?>
					<tr id="item-status"<?php echo ( $show_status ) ? '' : ' style="display: none;"'; ?>><td colspan="2">No items set</td></tr>
					<?php
				?>
				</tbody>
			</table>
			<h3><?php _e('Options'); ?></h3>
			<?php $this->options->form(); ?>
		</div>
		<?php
	}
	
	/**
	 * Build and output row for redaction
	 * @param array $item Associative array of redaction data
	 */
	function autos_row($item = array()) {
		$defaults = array('text' => '', 'data' => '', 'class' => '', 'id' => '');
		$show = !empty($item);
		$item = wp_parse_args($item, $defaults);
		if ( !$show ) {
			$item['class'] .= ' hid';
		}
		$item['class'] = trim($item['class']);
		if ( !$show || ( $show && !empty($item['text']) && !empty($item['data']) ) ) :
			$item['id'] = $this->add_prefix('item_' . $item['id']);
		?>
		<tr id="<?php echo $item['id']; ?>" class="<?php echo $item['class']; ?> item-row">
			<td class="prim">
				<strong><span class="orig_text"><?php echo $item['text']; ?></span></strong>
				<div class="row-actions">
					<span><a class="edit" href="#" title="Edit item"><?php _e('Edit'); ?></a> | </span>
					<span class="trash"><a href="#" class="delete" title="Delete item"><?php _e('Delete'); ?></a> <span class="confirm">Delete? <a href="#" class="yes" title="Confirm delete">Yes</a> or <a href="#" class="cancel" title="Cancel delete">Cancel</a></span></span>
				</div>
			</td>
			<td><span class="repl_text"><?php echo $item['data']; ?></span></td>
		</tr>
		<?php
		endif;
	}
	
	/**
	 * Retrieves automatic redactions
	 * @return array Auto redactions
	 */
	function get_auto_redactions() {
		return $this->options->get_data($this->opt_autos, array());
	}
	
	/**
	 * Save array of auto redactions
	 * @param $autos Auto redactions
	 */
	function save_auto_redactions($autos) {
		$this->options->set_data($this->opt_autos, $autos);
	}
	
	/**
	 * Adds quicktags to post edit form
	 * @return void
	 */
	function admin_post_quicktags() {
		$actions = array('edit-item', 'add');
		if ( in_array($this->util->get_action(), $actions) ) {
			wp_enqueue_script($this->add_prefix('quicktags'), $this->util->get_file_url('js/quicktags.js'), array('quicktags'));
		}
	}
	
	/*-** TinyMCE **-*/
	
	/**
	 * Place button on TinyMCE toolbar
	 * @param array $buttons Strings of button names
	 * @return array Array of button names
	 */
	function mce_buttons($buttons) {
		$pos = 3;
		$buttons = $this->util->array_insert($buttons, $this->add_prefix('redact'), $pos);
		return $buttons;
	}
	
	/**
	 * Register custom TinyMCE plugin
	 * @param array $plugin_array Array of TinyMCE plugins
	 * @return array Modified array of TinyMCE plugins
	 */
	function mce_external_plugins($plugin_array) {
		$plugin_array[$this->add_prefix('redact')] = $this->util->get_file_url('mce/plugins/eyes-only/editor_plugin.js');
		return $plugin_array;
	}
}
