/**
 * Dropdown plugin for jQuery
 *
 * @author Alexandru Busuioc (busuioc.alexandru@gmail.com)
 *
 * MIT License (MIT)
 */
(function ($) {
    'use strict';
    var dev_mode = false,
        default_options = {
            enableSearch: true,
            keyNav: true
        },
        __dropdown__ = 'dropdown';

    $.extend($.expr[':'], {

        focused: function (elem) {
            return elem.hasFocus;
        },

        containsNoCase: function (el, i, m) {
            var search = m[3];
            if (!search) return false;
            return eval("/" + search + "/i").test($(el).html());
        },

        startsWith: function (el, i, m) {
            var search = m[3];
            if (!search) return false;
            return eval("/^[/s]*" + search + "/i").test($(el).text());
        }

    });

    /*
     function SVGsupport() {
     return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
     }
     */

    var timeout_ID, search_string = '', search_el;

    var methods = {
        ul: {
            fix_width: function ($ul, $dropdown) {
                //	console.log( 'ul fix_width' );
                $ul.css('min-width', '');
                var ddsWidth = $dropdown.css('width');
                var ullWidth = $ul.css('width');
                if (parseInt(ullWidth) < parseInt(ddsWidth)) {
                    $ul.css('min-width', ddsWidth);
                }
            },
            fix_overflow: function ($ul) { /* resolve the scrollbar over content issue, runs once only (init) */
                var _ul = $ul[0];
                if (_ul.offsetHeight < _ul.scrollHeight) {
                    _ul.style.overflowY = 'scroll';
                }
            },
            set_gravity: function ($ul) {
                $ul.css('bottom', '');
                var ulTop = $ul.offset().top;
                var bodyTop = $(document).scrollTop();
                var windowHeight = $(window).height();
                var ulWindow = ulTop - bodyTop;
                var ulHeight = $ul.height();
                var changeGravity = ulHeight > ( windowHeight - ulWindow );
                var dodgePosition = changeGravity && ulWindow - ( ulHeight + $ul.parent().height() ) < 0;
                if (dodgePosition) {
                    $ul.css('bottom', -( windowHeight - ulWindow ));
                    return;
                }
                if (changeGravity) {
                    $ul.css({bottom: '100%'});
                }
            },
            wheel: function (evt, direction) {
                var $ul = $(this);
                var height = $ul.height();
                var scrollHeight = $ul.get(0).scrollHeight;
                if ((this.scrollTop === (scrollHeight - height) && direction < 0) || (this.scrollTop === 0 && direction > 0)) {
                    evt.preventDefault();
                }
            },
            keydown: function (e) {
                e.preventDefault();
                var $this = $(this), // the ul
                    options = this.parentNode.options;
                /* if UP or DOWN key is pressed: */
                if (e.keyCode == 38 || e.keyCode == 40) {
                    $this.trigger('item-nav', e);
                    return false;
                }
                /* if ENTER key is pressed: */
                if (e.keyCode == 13) {
                    $this.trigger('item-select', e);
                    return false;
                }
                if (!options.enableSearch) return;
                var c = String.fromCharCode(e.keyCode);
                if (typeof timeout_ID != 'undefined') clearTimeout(timeout_ID); // cancel the timeout setted up below, if exists
                search_string += c;
                // search for elements having text() starting with search_string
                var el = $this.find('a:startsWith(' + search_string + '):first');
                if (!el.length) { // if no elements found then search for elements having text() containing the search_string
                    el = $this.find('a:containsNoCase(' + search_string + '):first');
                }
                if (el.length) { // if an element is selected:
                    $this.find('a').removeClass('focus');
                    el.addClass('focus');
                    $this.trigger('item-focus-on-top');
                    search_el = el;
                    search_el.closest('ul').find('li').css('background-color', 'rgba(255,255,102,.4)');
                }
                // clear/delete the search_string after 2 seconds; we get the timeout_ID so we can cancel the timeout actions on keydown
                timeout_ID = setTimeout(function () {
                    if (typeof search_el == 'object') search_el.closest('ul').find('li').css({backgroundColor: ''});
                    search_string = '';
                    clearTimeout(timeout_ID);
                }, 2000);
            },
            itemNav: function (t, e) {
                if (e.keyCode != 38 && e.keyCode != 40) {
                    return;
                }
                var list = $(this); // the ul
                if (!list.find('a.focus').length) list.find('a:eq(0)').addClass('focus');
                var curr_item = list.find('a.focus');
                var items = list.find('a').length;
                var current_index = list.find('a').index(curr_item);
                var prev_item = current_index > 0 ? $('a:eq(' + (current_index - 1) + ')', list) : $('a:last', list);
                var next_item = current_index < ( items - 1 ) ? $('a:eq(' + (current_index + 1) + ')', list) : $('a:first', list);
                curr_item.removeClass('focus');
                if (e.keyCode == 38) {
                    prev_item.addClass('focus');
                } else /*if( e.keyCode == 40 ) */{
                    next_item.addClass('focus');
                }
                list.trigger('item-focus-on-top');
            },
            itemSelect: function (t, e) {
                if (e.keyCode == 13) {
                    $('a.focus', $(this)).trigger('click').closest('ul').trigger('close');
                }
            },
            itemFocus: function (e) {
                var $this = $(this);
                var el = $this.find('a.focus');
                if (el.length) { // if an element is selected:
                    $this.clearQueue().stop(true, true);
                    var pos = el.parent().position();
                    var fromTop = $this.scrollTop();
                    $this.animate({scrollTop: fromTop + pos.top});
                }
            }
        },
        dropdown: {
            update_title: function ($dropdown, $select) {
                //	console.log( 'updating one title' , $dropdown );
                var target = $dropdown.find('.title');
                if (typeof $select.attr('title') == 'undefined') {
                    var selValue = $('option[value="' + $select.val() + '"]:first', $select).html() /* if <option>myValue</option> type is used, then: */ || $select.val();
                    target.html(selValue);
                    $dropdown.attr('title', selValue);
                } else {
                    var selTitle = $select.attr('title');
                    target.html(selTitle);
                    $dropdown.attr('title', selTitle);
                }
            }
        },
        reload: function (options) {
            var _options = $.extend({}, default_options, options);
            return this.each(function () {
                var $select = $(this),
                    _seek_by_ = 'div[data-rel="' + this.id + '"]',
                    $dropdown = $select.parent().find(_seek_by_);
                if (!$dropdown.length) {
                    dev_mode && console.warn('No Dropdown was found: ' + _seek_by_);
                } else {
                    //	dev_mode && console.log('The Dropdown stylization was initialised for: ' + _seek_by_ );
                    $dropdown.remove();
                    //	setTimeout( function(){
                    methods.init.call($select, _options);
                    //	} , 500 );
                }
            });
        },
        init: function (options) {

            var _options = $.extend({}, default_options, options);

            return this.each(function () {

                var $select = $(this);
                var sClass = $select.attr('class') ? ' ' + $select.attr('class') : '';
                $select.attr('id') || ( $['utils'] && $['utils']['randUniqueID'] && $select.attr('id', $['utils']['randUniqueID']('dropID_')) );
                var $ul = $('<ul />', {'class': 'options', tabindex: '0'});

                $select.find('option').each(function () {
                    var $this = $(this);
                    var cls = $this.attr('class') ? ' class="' + $this.attr('class') + '"' : '';
                    $ul.append('<li' + cls + '><a href="' + $this.val() + '" title="' + $this.html() + '">' + $this.html() + '</a></li>');
                });

                var $dropdown = $('<div/>', {
                        'data-rel': $select.attr('id'),
                        'class': 'dds' + sClass
                    })
                        .append('<div class="arrow mask"><div class="arr"></div></div><div class="title"></div>')
                        .append($ul)
                    ;

                //	$select.prop('disabled',true); // test purposes

                if ($select.prop('disabled')) $dropdown.append('<div class="disabled"></div>');

                $ul
                    .bind('open', function () {
                        $(this).removeClass('closed');
                    })
                    .bind('focusout.' + __dropdown__ + ' close.' + __dropdown__, function () {
                        var $ul = $(this);
                        if (!$ul.hasClass('closed')) $ul.addClass('closed');
                    })
                    .on('click mousedown', 'a', function (e) {
                        e.stopPropagation();
                        if (e.type == 'mousedown') return false; // prevent loosing focus from $ul
                        e.preventDefault();
                        var a = $(this);
                        $select.val(a.attr('href'));
                        $ul.trigger('close');
                        $select.trigger('change');
                    })
                    /* prevent window scroll when scrolling the list */
                    .on('mousewheel', methods.ul.wheel);
                //	console.log( options );
                if (_options.keyNav) {
                    // keyboard navigation over DDSes
                    $ul
                        .on('item-nav.' + __dropdown__, methods.ul.itemNav)
                        .on('item-focus-on-top.' + __dropdown__, methods.ul.itemFocus)
                        .on('item-select.' + __dropdown__, methods.ul.itemSelect)
                        .on('keydown.' + __dropdown__, methods.ul.keydown);
                }

                $(window).on('scroll.' + __dropdown__, function () {
                    if (!$ul.hasClass('closed')) {
                        methods.ul.set_gravity($ul);
                    }
                });

                $select.hide().before($dropdown);
                methods.dropdown.update_title($dropdown, $select);
                methods.ul.fix_width($ul, $dropdown);
                methods.ul.fix_overflow($ul);

                $ul.trigger('close');
                // ---------
                $dropdown
                    .on('click.' + __dropdown__, function () {
                        if (!$select.prop('disabled')) $dropdown.find('.title').click();
                    }).get(0).options = _options;
                $dropdown
                    .find('.title,.arrow').on({
                        mousedown: function (e) {
                            e.stopPropagation();
                            this.isHidden = $ul.hasClass('closed');
                        },
                        click: function (e) {
                            e.stopPropagation();
                            if (typeof this.isHidden == 'undefined') {
                                this.isHidden = $ul.hasClass('closed');
                            }
                            if (this.isHidden) {
                                $ul.trigger('open');
                                methods.ul.fix_width($ul, $dropdown);
                                methods.ul.set_gravity($ul);
                                $ul.focus();
                            }
                        }
                    });
                // ---------
                $select.bind('change.' + __dropdown__ + ' update.' + __dropdown__ + '', function () {
                    methods.dropdown.update_title($dropdown, $select);
                });
                $select.bind('click.' + __dropdown__, function () {
                    $dropdown.click();
                });
            }); // ----------------------
        },
        undo: function () {
        }
    };
    $.fn.dropdown = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.dropdown');
        }
    };
})(jQuery);
