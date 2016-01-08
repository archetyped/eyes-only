/**
 * Redactor MCE Plugin
 *
 * @author Archetyped
 * @package Eyes Only
 */

(function() {
	// Load plugin specific language pack
	var pluginId = 'eop_redact';
	
	tinymce.PluginManager.requireLangPack(pluginId);
	
	tinymce.create('tinymce.plugins.EOPRedactor', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 *
		*/
		
		//TODO Create icon
		init : function(ed, url) {
			var props = {
						'id':			pluginId,
						'edElement':	'span',
						'className':	'redact',
						'shortcode':	'redact',
						'iconPath':		'/img/icon.gif',
						};
			/* Utility methods */
			var util = {
						'isRedacted': function(e) {
								return (ed.dom.hasClass(e, props.className)) ? true : false;
							},
					};
					
			/* Shortcode methods */
			var shortcode = {
				'markup': {'start': '[', 'end': ']', 'close': '/'},
				'wrap': function(txt) {
					return this.markup.start + props.shortcode + this.markup.end + txt + this.markup.start + this.markup.close + props.shortcode + this.markup.end;
				}
			};
			
			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('eop_redactor');
			ed.addCommand(props.id, function() {
				//Things to do when button is pressed
				var sel = ed.selection.getContent();
				ed.selection.setContent(shortcode.wrap(sel));
			});
			
			/*
			ed.onInit.add(function() {
				if (ed.settings.content_css !== false)
					ed.dom.loadCSS(url + '/css/content.css');
			});
			*/

			// Register button
			ed.addButton(props.id, {
				//title : props.id + '.desc',
				title: ed.getLang(props.id + '.desc'),
				cmd : props.id,
				image : url + props.iconPath
			});

			//Format quicktag in editor
			ed.onBeforeSetContent.add(function(ed, o) {
				/*
				var re = /\[redact(.*?)\](.*?)\[\/redact\]/g;
				o.content = o.content.replace(re, '<span class="' + props.className + '"$1>$2</span>');
				*/
			});

			//Revert content to quicktag
			/*
			ed.onPostProcess.add(function(ed, o) {
				if (o.get) {
					var reInit = /<span\s([^>]*)class="redact"([^>]*)>(.*?)<\/span>/g;
					o.content = o.content.replace(reInit, '[' + props.shortcode + '$1$2]$3[/' + props.shortcode + ']');
				}
			});
			*/
			
			//Add status bar text for internal urls
			/*
			ed.onPostRender.add(function() {
				if (ed.theme.onResolveName) {
					ed.theme.onResolveName.add(function(th, o) {
						if (o.node.nodeName == 'SPAN') {
							if (ed.dom.hasClass(o.node, props.className))
								o.name = props.className;
						}
					});
				}
			});
			*/
			
			//Enable/Disable button based on text selection
			ed.onNodeChange.add(function(ed, cm, e) {
				
			});
		},

		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl : function(n, cm) {
			return null;
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Eyes Only',
				author : 'Archetyped',
				authorurl : 'http://archetyped.com',
				infourl : 'http://archetyped.com/tools/eyes-only/',
				version : "1.0"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add(pluginId, tinymce.plugins.EOPRedactor);
})();