// http://mathiasbynens.be/notes/oninput#comment-1
$.fn.input = function(fn) {
	var $this = this;
	if (!fn) {
		return $this.trigger('keydown.input');
	}
	return $this.bind({
		'input.input': function(event) {
			$this.unbind('keydown.input');
			fn.call(this, event);
		},
		'keydown.input': function(event) {
			fn.call(this, event);
		}
	});
};

// http://gist.github.com/326491
$.fn.insertAtCaret = function(myValue) {
	return this.each(function() {
		var me = this;
		if (document.selection) { // IE
			me.focus();
			sel = document.selection.createRange();
			sel.text = myValue;
			me.focus();
		} else if (me.selectionStart || me.selectionStart == 0) { // Real browsers
			var startPos = me.selectionStart,
			    endPos = me.selectionEnd,
			    scrollTop = me.scrollTop;
			me.value = me.value.substring(0, startPos) + myValue + me.value.substring(endPos, me.value.length);
			me.focus();
			me.selectionStart = startPos + myValue.length;
			me.selectionEnd = startPos + myValue.length;
			me.scrollTop = scrollTop;
		} else {
			me.value += myValue;
			me.focus();
		}
	});
};

$(function() {
	$.fn.addScript = function(str, myLib) {
		return this.click(function(event) {
			if (!~$prepHTML.val().indexOf(str)) {
				$prepHTML.insertAtCaret('<script src="//' + (myLib ? 'www.cinsoft.net/' : 'ajax.googleapis.com/ajax/libs/') + str + '.js">\x3C/script>\n');
			}
			$prepHTML.focus();
			event.preventDefault();
		});
	};

	// Title / slug handling
	var $title = $('#title'),
	    $slug = $('#slug'),
	    $preview = $('mark'),
	    $tests = $('#tests'),
	    $prepHTML = $('#prep-html'),
	    $prepJS = $('#prep-js'),
	    $jsFields = $prepJS.add('#setup, #teardown'),
	    testHTML = '<h4>Code snippet 1</h4><div><label for="test[1][title]">Title <em title="This field is required">*</em> </label><input type="text" name="test[1][title]" id="test[1][title]"></div><div><label for="test[1][defer]">Async </label><label class="inline"><input type="checkbox" value="y" name="test[1][defer]" id="test[1][defer]"> (check if this is an <a href="/faq#async">asynchronous test</a>)</label></div><div><label for="test[1][code]">Code <em title="This field is required">*</em> </label><textarea name="test[1][code]" class="code-js" id="test[1][code]" maxlength="16777215"></textarea></div></fieldset>',
	    testCount = $('fieldset', $tests).length,
	    $addTest = $('<button id="add-test" title="Add another code snippet to the test case">Add code snippet</button>').insertBefore('.submit'),
	    $beautify = $('<button id="beautify" title="Beautify all code fields (HTML and JavaScript)">Beautify code</button>').insertBefore($addTest),
	    $addjQuery = $('<button id="add-jquery" title="jQuery v1.x">jQuery</button>').addScript('jquery/1/jquery.min'),
	    $addMooTools = $('<button id="add-mootools" title="MooTools v.1.3.x">MooTools</button>').addScript('mootools/1.3/mootools-yui-compressed'),
	    $addYUI = $('<button id="add-yui" title="YUI v2.9.0">YUI</button>').addScript('yui/2.9.0/build/yuiloader/yuiloader-min'),
	    $addPrototype = $('<button id="add-prototype" title="Prototype v1.x">Prototype</button>').addScript('prototype/1/prototype'),
	    $addDojo = $('<button id="add-dojo" title="Dojo v1.x">Dojo</button>').addScript('dojo/1/dojo/dojo.xd'),
	    $addExt = $('<button id="add-ext" title="Ext Core v3.x">Ext Core</button>').addScript('ext-core/3/ext-core'),
	    $addMyLib = $('<button id="add-mylib" title="My Library v0.99">My Library</button>').addScript('mylib099-min', true),
	    $addDiv = $('<div id="add-buttons" />'),
	    storage = (function() { try { var storage = window.localStorage; return storage.getItem && storage; } catch(e) {} }()),
	    $authorFields;

	// http://jsperf.com/slugs
	function sluggify(str) {
		return str.toLowerCase().match(/[a-z0-9]+/ig).join('-');
	}

	function beautify(lang) {
		var el = this,
		    fn = lang == 'html' ? style_html : js_beautify;
		el.value = fn(el.value, {
			'indent_size': 2,
			'indent_char': ' '
		});
	}

	if (storage) {
		$authorFields = $('#author, #author-email, #author-url');
		if ($authorFields.length == $authorFields.filter(function() { return !this.value; }).length) {
			$authorFields.each(function() {
				this.value = storage[this.id] || '';
			}).input(function() {
				storage[this.id] = this.value;
			});
		}
	}

	$addTest.click(function(event) {
		$(testHTML.replace(/1/g, ++testCount)).appendTo($tests);
		event.preventDefault();
	});

	// AMIDOINITRITE?
	$addDiv.append($addjQuery).append($addPrototype).append($addMooTools).append($addYUI).append($addDojo).append($addExt).append($addMyLib).insertBefore('#add-libraries');

	if ($slug.length) {
		$title.input(function() {
			if (!$slug.data('x')) {
				if ('' === $.trim(this.value)) {
					$slug.val('');
					$preview.text('slug');
					return;
				}
				var slug = sluggify(this.value);
				$slug.val(slug);
				$preview.text(slug);
			}
		}).trigger('keyup');
		$slug.input(function() {
			if ('' === $.trim(this.value)) {
				if ('' === $.trim($title.val())) {
					return $preview.text('slug');
				} else {
					return $preview.text(sluggify($title.val()));
				};
			};
			$preview.text(sluggify(this.value));
		});
		$slug.change(function() {
			$slug.val(sluggify(this.value));
			var x = true;
			if ('' === $.trim($slug.val())) {
				x = false;
				var slug = sluggify($title.val());
				$slug.val(slug);
				$preview.text(slug);
			}
			$slug.data('x', x);
		});
	}

	// Anti-spam, kinda
	$('#question').val('no');

	// Beautify
	$beautify.click(function(event) {
		$jsFields.add('.code-js').each(beautify);
		beautify.call($prepHTML[0], 'html');
		event.preventDefault();
	});
});

// http://mathiasbynens.be/notes/async-analytics-snippet
var _gaq = [['_setAccount', 'UA-6065217-40'], ['_trackPageview']];
(function(d, t) {
	var g = d.createElement(t),
	    s = d.getElementsByTagName(t)[0];
	g.src='//www.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g,s);
}(document, 'script'));
