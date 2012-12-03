if ( typeof eop == 'undefined' || typeof eop != 'object' )
	eop = {};
if ( !('util' in eop) || typeof eop.util == 'undefined' || typeof eop.util != 'object' )
	eop.util = {};
(function($) {
	var o = eop;
	var u = o.util;
	
	o.prefix = 'eop';
	o.sep = '_';
	
	o.getSeparator = function(sep) {
		if ( typeof sep == 'undefined' )
			return o.sep;
		return sep.toString();
	}
	
	o.getPrefix = function(sep) {
		return ( o.prefix.length ) ? this.prefix + this.getSeparator(sep) : '';
	}
	
	/**
	 * Add Prefix to value
	 * @param string val Value to add prefix to
	 * @param string sep Separator
	 */
	o.addPrefix = function(val, sep) {
		return this.getPrefix(sep) + val;
	}
	
	/* Utility methods */
	/**
	 * Make a selector from one or more selectors
	 */
	u.makeSelector = function() {
		var sel = [];
		var start = 0;
		var obj = {};
		var val;
		if ( $.isPlainObject(arguments[0]) ) {
			start = 1;
			obj = arguments[0];
		}
		for ( var i = start; i < arguments.length; i++ ) {
			val = ( arguments[i].toString() in obj ) ? obj[arguments[i]] : arguments[i].toString();
			sel.push(val);
		}
		return sel.length ? sel.join(' ') : '';
	}
	
	/**
	 * Make a valid attribute from a selector
	 * @param {Object} selector Selector to make attribute from
	 * @return string Attribute value
	 */
	u.makeAttribute = function(selector) {
		var ret = '';
		if ( typeof selector != 'undefined') {
			var sel = $.trim(selector.toString());
			if ( sel != '' ) {
				if ( $.inArray(sel[0], ['.', '#', ':']) != -1 )
					sel = sel.substring(1);
				ret = sel;
			}
		}
		return ret;
	}
})(jQuery);
