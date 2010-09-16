/* Admin */
if ( typeof eop == 'undefined' || typeof eop != 'object' )
	eop = {};
if ( typeof eop.admin == 'undefined' || typeof eop.admin != 'object' )
	eop['admin'] = {};
(function($) {
	var a = eop.admin;
	a.nonce;
	a.action_real;
	a.action = eop.addPrefix('autos_modify');
	a.elements = {
			nonce:			'#_wpnonce',
			url:			'#' + eop.addPrefix('action'),
			action_real:	'#' + eop.addPrefix('action_real'),
			table:			'#eop_autos',
			add_form:		'#eop_inline_add',
			edit_form:		'#eop_inline_edit',
			form_title:		'.form_title',
			form_orig:		'.orig_text',
			form_repl:		'.repl_text',
			form_item:		'itemEditing',
			cancel:			'.cancel',
			save:			'.save',
			add_new:		'#eop_add_new',
			item:			'.item-row',
			item_orig:		'.orig_text',
			item_repl:		'.repl_text',
			item_actions:	'.row-actions',
			item_alternate:	'alternate',
			edit:			'.edit',
			del:			'.delete',
			confirm:		'.confirm',
			yes:			'.yes',
			hidden:			'hid',
			status:			'#item-status',
			block_attr:		'blocked',
			block_class:	'blocked'
	};
	
	a.init = function() {
		/* Events */
		
		//Add new button
		$(a.elements.add_new).click(function() {
			a.add.load();
			return false;
		});
		
		//Cancel inline edit 
		$(eop.util.makeSelector(a.elements, 'add_form', 'cancel')).click(function() {
			a.add.cancel();
			return false;
		});
		
		//Add form save action
		$(eop.util.makeSelector(a.elements, 'add_form', 'save')).click(function() {
			a.add.save();
			return false;
		});
		
		//Edit Item
		$(eop.util.makeSelector(a.elements, 'item_actions', 'edit')).click(function() {
			a.edit.load(this);
			return false;
		});
		
		//Delete Item
		
		 //Show Confirmation
		$(eop.util.makeSelector(a.elements, 'item_actions', 'del')).click(function() {
			a.del.check(this);
			return false;
		});
		
		 //Confirm Deletion
		 $(eop.util.makeSelector(a.elements, 'item_actions', 'confirm', 'yes')).click(function() {
		 	a.del.confirm(this);
			return false;
		 })
		 
		 //Cancel Deletion
		 $(eop.util.makeSelector(a.elements, 'item_actions', 'confirm', 'cancel')).click(function() {
		 	a.del.cancel(this);
			return false;
		 });
		 
		 /* Values */
		 
		 a.nonce = $(a.elements.nonce).val();
		 a.action_real = $(a.elements.action_real).val();
	};
	
	/**
	 * Request Methods
	 */
	a.request = {
		/**
		 * Build ajax request
		 * @param {Object} data Data to send
		 * @return object Normalized Data to send
		 */
		build: function(data) {
			//Validate
			if ( !$.isPlainObject(data) )
				return false;
			//Build request
			data['action'] = a.action;
			data['_ajax_nonce'] = a.nonce;
			if ( !this.hasAction(data) )
				data = this.setAction(data, 'save');
			return data;
		},
		send: function(data, successCallback) {
			if ( typeof successCallback != 'function' )
				successCallback = this.success;
			$.post(this.getURL(), this.build(data), successCallback, 'json');
		},
		success: function(r) {
			
		},
		getURL: function() {
			return $(a.elements.url).val();
		},
		hasAction: function(data) {
			return (a.action_real in data);
		},
		setAction: function(data, action) {
			data[a.action_real] = action;
			return data;
		}
	};
	
	/**
	 * Form methods
	 */
	a.form = {
		/**
		 * Retrieve form data
		 * @param {Object} frm Form to get data from
		 * @return object Form data (obj,repl)
		 */
		getData: function(frm) {
			//Create new object with form data
			var data = {
				'orig': $(frm).find(a.elements.form_orig).val(),
				'repl':	$(frm).find(a.elements.form_repl).val()
			};
			return data;
		},
		/**
		 * Set form data
		 * @param {Object} frm Form to load data into
		 * @param {Object} data Data to load (orig,repl)
		 */
		setData: function(frm, data) {
			//Clear form
			this.reset(frm);
			//Set search text
			if ( 'orig' in data ) {
				$(frm).find(a.elements.form_orig).val(data.orig);
				//Set replacement text
				if ( 'repl' in data ) {
					$(frm).find(a.elements.form_repl).val(data.repl);
				}
			}
		},
		/**
		 * Reset form
		 * @param {Object} frm Form to reset
		 */
		reset: function(frm) {
			//Clear text fields
			$(frm).find('input:text, textarea').each(function() {
				$(this).val('');
			});
		},
		/**
		 * Hide and reset form
		 * @param {Object} frm Form to hide
		 */
		cancel: function(frm) {
			$(frm).hide();
			this.reset(frm);
		}
	};
	
	/**
	 * Item methods
	 */
	a.item = {
		/**
		 * Make new item and display in UI
		 * @param {Object} data Item data (orig, repl)
		 */
		make: function(data) {
			var items = this.get();
			if ( items.length ) {
				//Make new row
				var item = $(items[0]).clone(true);
				//Add ID
				$(item).attr('id', this.makeId());
				//Validate data
				if ( $.isPlainObject(data) ) {
					if ( !('orig' in data) )
						data.orig = '';
					if ( !('repl' in data) )
						data.repl = '';
				}
				//Set data
				this.setData(item, data);
				//Set attributes
				if ( $(item).hasClass(a.elements.item_alternate) )
					$(item).removeClass(a.elements.item_alternate);
				else
					$(item).addClass(a.elements.item_alternate);
				//Add Item to UI
				$(item).insertBefore(items[0]).removeClass(a.elements.hidden);
			}
		},
		/**
		 * Generate temporary ID
		 * @return string Temporary ID
		 */
		makeId: function(val) {
			var id;
			if (typeof val == 'undefined') {
				//Create ID
				val = new Date().valueOf() - Math.floor(Math.random() * 65 + 1);
			}
			return eop.addPrefix('item_' + val);
		},
		/**
		 * Retrieve item(s)
		 * @param {Object} el Item element or Child element of item to retrieve
		 * @return array|object All items or single item based on el
		 */
		get: function(el) {
			//Return single item if item or child element is specified
			if ( typeof el != 'undefined' ) {
				id = parseInt(el.toString());
				if ( !isNaN(id) )
					el = '#' + this.makeId(id); 
				var ret = ( $(el).hasClass(eop.util.makeAttribute(a.elements.item)) ) ? $(el) : $(el).parents('tr');
				if ( ret.length )
					return $(ret[0]);
			}
			//Return all items if no item specified
			return $(a.elements.item);
		},
		/**
		 * Retrieve Item ID
		 * @param {Object} el Item element
		 * @return int Item ID
		 */
		getId: function(el) {
			var id = $(this.get(el)).attr('id');
			id = id.split('_');
			return id[id.length - 1];
		},
		/**
		 * Retrieve all IDs
		 */
		getIds: function() {
			var ids = []; 
			var i = this;
			this.get().each(function() { ids.push(i.getId(this)) });
			return ids;
		},
		/**
		 * Blocks item from modifications (e.g. while being saved on server)
		 * @param {Object} item Item to block
		 */
		block: function(item) {
			item = $(this.get(item));
			$(item).data(a.elements.block_attr, true);
			$(item).addClass(a.elements.block_class);
		},
		/**
		 * Unblocks item from modifications (e.g. once item finished saving on server)
		 * @param {Object} item Item to unblock
		 */
		unblock: function(item) {
			var item = $(this.get(item));
			$(item).data(a.elements.block_attr, false);
			$(item).removeClass(a.elements.block_class);
		},
		/**
		 * Checks if item is blocked from modifications
		 * @param {Object} item Item to check
		 * @return bool TRUE if blocked, FALSE otherwise
		 */
		isBlocked: function(item) {
			return ( !!$(this.get(item)).data(a.elements.block_attr) );
		},
		/**
		 * Retrieve Item data
		 * @param {Object} item Item to retrieve data from
		 * @return {Object} Item data (orig,repl)
		 */
		getData: function(item) {
			var data = {
				id: this.getId(item),
				orig: $(item).find(a.elements.item_orig).text(),
				repl: $(item).find(a.elements.item_repl).text()
			};
			return data;
		},
		/**
		 * Set Item data
		 * @param {Object} item Item element
		 * @param {Object} data Data for Item
		 */
		setData: function(item, data, save) {
			//Make sure data is valid
			if ( this.isBlocked(item) || !('orig' in data) || !('repl' in data) || $.trim(data.orig).length == 0 )
				return false;
			//Set item data as long as they are different
			if ( data.orig != data.repl ) {
				$(item).find(a.elements.item_orig).text(data.orig);
				$(item).find(a.elements.item_repl).text(data.repl);
				//Save to server
				save = ( typeof save != 'undefined' ) ? !!save : true;
				if ( save ) {
					this.save(item);
				}
			}
		},
		/**
		 * Save item via AJAX
		 * @param {Object} item Item to save
		 */
		save: function(item) {
			data = this.getData(item);
			var action = 'update';
			//Block item from edits
			this.block(item);
			//Send request to server
			data = a.request.setAction(data, action);
			a.request.send(data, this.saveSuccess);
		},
		/**
		 * Code to execute when item was successfully saved
		 * @param {Object} r Server response object
		 */
		saveSuccess: function(r) {
			var id = ( 'id' in r ) ? r.id : false;
			//Set new ID
			if ( 'new_id' in r && id !== false ) {
				$(a.item.get(r.id)).attr('id', a.item.makeId(r.new_id));
				id = r.new_id;
			}
			//Unblock item from modification
			a.item.unblock(id);
		},
		/**
		 * Check if search is already set
		 * @param {Object} search Text to search for
		 * @return {bool} TRUE if search exists, FALSE otherwise
		 */
		exists: function(search) {
			//Build array of all existing searches
			var searches = $(a.elements.item_orig).map(function() {
				return $(this).text();
			}).get();
			
			//Check if value exists in array
			return ( $.inArray(search, searches) != -1 );
		},
		/**
		 * Delete item
		 * @param {Object} item Item Element
		 * @param bool remove (optional) Whether or not to remove item from UI (Default: TRUE)
		 */
		del: function(item, remove) {
			if ( this.isBlocked(item) )
				return false;
			//Set whether item should be removed
			var remove = ( typeof remove != 'undefined' ) ? !!remove : true;
			var item = this.get(item);
			
			//Delete from server
			var data = a.item.getData(item);
			data = a.request.setAction(data, 'delete');
			a.request.send(data);
			
			//Remove from UI
			if ( remove )
				$(item).remove();
			a.status.set();
		}
	};
	
	/**
	 * Status methods
	 */
	a.status = {
		/**
		 * Get status message element
		 */
		get: function() {
			return $(a.elements.status);
		},
		/**
		 * Display status message
		 */
		show: function() {
			this.get().show();
		},
		/**
		 * Hide status message
		 */
		hide: function() {
			this.get().hide();
		},
		/**
		 * Set status message state (show or hide)
		 * Based on whether there are existing items or not
		 */
		set: function() {
			var items = a.item.get();
			if ( items.length && !$(items[0]).hasClass(a.elements.hidden) )
				this.hide();
			else
				this.show();
		}
	};
	
	/**
	 * Item adding methods
	 */
	a.add = {
		/**
		 * Retrieve Add form element
		 * @return object Add form
		 */
		get: function() {
			return $(a.elements.add_form);
		},
		/**
		 * Display Add form
		 */
		load: function() {
			a.status.hide();
			this.get().show();
		},
		/**
		 * Reset Add form to default values
		 */
		reset: function() {
			a.form.reset(this.get());
		},
		/**
		 * Hide Add form
		 */
		cancel: function() {
			//Hide form
			this.get().hide();
			a.status.set();
			//Clear data from form
			this.reset();
		},
		/**
		 * Save data in Add form
		 */
		save: function() {
			//Validate data
			var data = a.form.getData(this.get());
			//Check for duplicate searches
			if ( $.trim(data.orig).length && !a.item.exists(data.orig) ) {
				//Insert new row and save to server
				a.item.make(data);
			}
			//Close form
			this.cancel();
		}
	};
	
	/**
	 * Item editing methods
	 */
	a.edit = {
		/**
		 * Retrieve editor form
		 * @return object Editor form element
		 */
		get: function() {
			var ed = $(a.elements.edit_form);
			//Return editor element (if already created)
			if ( !$(ed).length ) {
				//Create new editor element
				ed = $(a.add.get()).clone().css('display', 'table-row').hide();
				//Change attributes
				$(ed).attr('id', eop.util.makeAttribute(a.elements.edit_form)).find(a.elements.form_title).html('Edit');
				$(ed).find(a.elements.save).val('Save');
				$(ed).get(0)[a.elements.form_item] = false;
				//Setup Events
				$(ed).find(a.elements.cancel).click(function() {
					a.edit.cancel();
					return false;
				});
				$(ed).find(a.elements.save).click(function() {
					a.edit.save();
					return false;
				})
				//Add to table
				a.add.get().after($(ed));
			}
			//Return element
			return $(ed);
		},
		/**
		 * Retrieve item element being edited by form
		 * Reference to item is stored in editor DOM object
		 * @return object Item element being edited
		 */
		getItem: function() {
			return $($(this.get()).get(0)[a.elements.form_item]);
		},
		/**
		 * Load Editor form for the specified item
		 * @param {Object} el Item to edit (Generally the "edit" link nested in item element)
		 */
		load: function(el) {
			//Hide add form
			a.add.cancel();
			//Get editor form
			var ed = this.get();
			//Show previous item
			this.getItem().show();
			//Move to position
			var item = this.connect(ed, el);
			$(ed).insertAfter($(item).hide());
			//Set Attributes
			if ( $(item).hasClass(a.elements.item_alternate) )
				$(ed).addClass(a.elements.item_alternate);
			else
				$(ed).removeClass(a.elements.item_alternate);
			//Set data
			a.form.setData(ed, a.item.getData(item));
			//Display
			$(ed).show();
		},
		/**
		 * Connect item currently being edited with editor form
		 * @param {Object} ed Editor form element
		 * @param {Object} el Item to edit (Generally the "edit" link nested in item element)
		 * @return {Object} Item element being edited
		 */
		connect: function(ed, el) {
			//Connect with item
			var item = $(el).parents('tr');
			$(ed).get(0)[a.elements.form_item] = item;
			return item;
		},
		/**
		 * Save edited item data
		 */
		save: function() {
			//Update item
			var item = this.getItem();
			var ed = this.get();
			//Save Data
			a.item.setData(item, a.form.getData(ed));
			
			//Hide form
			this.cancel();
		},
		/**
		 * Reset edit form
		 */
		reset: function() {
			a.form.reset(this.get());
		},
		/**
		 * Hide edit form
		 */
		cancel: function() {
			a.form.cancel(this.get());
			this.getItem().show();
		},
	};
	
	/**
	 * Item deletion methods
	 */
	a.del = {
		/**
		 * Display delete confirmation
		 * @param {Object} el Delete link element
		 */
		check: function(el) {
			//Hide delete link
			$(el).hide();
			//Display confirmation options
			$(el).parent().find(a.elements.confirm).show();
		},
		/**
		 * Cancel delete action
		 * @param {Object} el Element that cancels deletion
		 */
		cancel: function(el) {
			//Hide confirmation options
			$(el).parent().hide();
			//Display delete link
			$(el).parent().siblings(a.elements.del).show();
		},
		/**
		 * Confirm delete action
		 * @param {Object} el Element that confirms deletion
		 */
		confirm: function(el) {
			//Delete data from server
			a.item.del(el);
		}
	};
	
	/* Startup */
	$('html').addClass('js');
	$('document').ready(function() {eop.admin.init()});
})(jQuery);
