/*!
 * jQuery Multi List Auto Complete Plugin v0.1
 * Authors: Gokhan Songul <gkhn.songul@gmail.com>
 *          Gokhan Turunc <gokhan.turunc@gmail.com>
 *
 * Date: 2013-5-2
 */

(function($) {

    'use strict';

    /**
     * @param {Object} options
     * @constructor
     */
    $.fn.multiListAutoComplete = function(options) {

        if (!options || (options.proxy && typeof options.proxy !== 'function') || !options.appendTo) {
            throw 'Error!';
        }


        /**
         * @type {jQueryObject}
         */
        var $element = $(this);


        /**
         * @type {null|jQueryObject}
         */
        var $appendTo = null;


        /**
         * @type {Array.<number>}
         */
        var timeout = [];


        /**
         * @type {number}
         */
        var listCount = 0;


        /**
         * @type {Number}
         */
        var visibleTimeOut = 0;


        /**
         * @type {string}
         */
        var autocomplete = 'ul.autocomplete';


        var dataParser = function() {
            config.proxy($element.val(), function(response) {

                if (response && response['list']) {
                    clearSearchResult();

                    for (var i in response['list']) {
                        listCount++;
                        var list = response['list'][i];

                        if (list && $.isArray(list)) {
                            var $listDOM = createListDom();

                            for (var x = 0; x < list.length; x++) {
                                var listSearchItem = list[x];
                                $listDOM.append(config.renderItem(listSearchItem, config));
                            }
                        }
                    }

                    if (listCount > 1) {
                        $appendTo.addClass('multipleList');
                    } else {
                        $appendTo.removeClass('multipleList');
                    }

                    openWrapper();
                }

            });
        };


        /**
         * @param {Object} item
         * @param {Object} config
         * @return {jQueryObject}
         */
        var renderItem = function(item, config) {
            var $li = $('<li></li>').addClass('autocomplete-search-item');

            var $a = $('<a></a>').appendTo($li);

            $a
                .data('value', item[config.value])
                .data('label', item[config.label])
                .html(item[config.label])
                .bind('click', function() {
                    setSelectedTextToInput(item[config.value]);
                    config.onSelect && config.onSelect.call(this, $a);
                });

            return $li;
        };


        /**
         * @param {string} text
         */
        var setSelectedTextToInput = function(text) {
            $element.val(text).focus();
        };


        /**
         * @return {jQueryObject}
         */
        var createListDom = function() {
            return $('<ul></ul>')
                .addClass('autocomplete')
                .addClass('list-' + listCount)
                .appendTo(config.appendTo);
        };


        var clearSearchResult = function() {
            $appendTo.find(autocomplete).remove();
        };


        var openWrapper = function() {
            config.onOpen && config.onOpen(listCount);
            $appendTo.fadeIn(config.delayTime);

            if (config.visibleTime) {
                visibleTimeOut = setTimeout(function() {
                    closeWrapper();
                }, config.visibleTime);
            }

        };


        var closeWrapper = function() {
            $appendTo.fadeOut(config.delayTime, config.onClose);
        };


        var clearTimeouts = function() {
            for (var i = 0; i < timeout.length; i++) {
                clearTimeout(timeout[i]);
            }
        };


        /**
         * @return {jQueryObject}
         */
        var getHoverItem = function() {
            var $li = $appendTo.find(autocomplete).find('li');
            var $hover = $li.filter('.state-hover');

            return $hover;
        };


        /**
         * @param {jQueryObject=} $hoverItem
         * @return {jQueryObject}
         */
        var getListOfHoverItem = function($hoverItem) {
            var $item = null;
            if ($hoverItem && $hoverItem.length) {
                $item = $hoverItem;
            } else {
                $item = getHoverItem();
            }

            return $item.parents(autocomplete);
        };


        /**
         * @param {jQueryObject} $item
         */
        var changeHoverItem = function($item) {
            var $currently = getHoverItem();
            $currently.removeClass('state-hover');

            $item.addClass('state-hover');
        };


        /**
         * @param {jQueryObject} $list
         * @return {jQueryObject}
         */
        var getNextList = function($list) {
            if (!$list || !$list.length) {
                $list = getListOfHoverItem();
            }

            var $target = $list.next(autocomplete);
            if (!$target.length) {
                $target = $list.parent().find(autocomplete).first();
            }

            return $target;
        };


        /**
         * @param {jQueryObject} $list
         */
        var getPreviousList = function($list) {
            if (!$list || !$list.length) {
                $list = getListOfHoverItem();
            }

            var $target = $list.prev(autocomplete);
            if (!$target.length) {
                $target = $list.parent().find(autocomplete).last();
            }

            return $target;
        };


        /**
         * @param {jQueryObject} $currentlyItem
         * @param {jQueryObject} $targetList
         */
        var matchItems = function($currentlyItem, $targetList) {
            var index = $currentlyItem.index();
            var $targetItem = $targetList.find('li').eq(index);

            if (!$targetItem || !$targetItem.length) {
                $targetItem = $targetList.find('li').eq(0);
            }

            return $targetItem;
        };


        /**
         * @param {jQueryObject} $currently
         */
        var handleDownKey = function($currently) {
            if (!$appendTo.is(':visible')) {
                openWrapper();
            }

            if (!$currently.length) {
                var $firstItem = $appendTo.find(autocomplete).find('li').first();
                changeHoverItem($firstItem);
            } else {
                var $target = $currently.next();
                if (!$target.length) {
                    $target = getNextList().find('li').first();
                }

                changeHoverItem($target);
            }
        };


        /**
         * @param {jQueryObject} $currently
         */
        var handleUpKey = function($currently) {
            var $target = $currently.prev();

            if (!$target.length) {
                $target = getPreviousList().find('li').last();
            }

            changeHoverItem($target);
        };


        /**
         * @param {jQueryObject} $currently
         * @param {Object} e
         */
        var handleLeftRightKey = function($currently, e) {
            if ((!$currently || !$currently.length) || listCount < 2) {
                return;
            }

            var $activeList = getListOfHoverItem($currently);
            var $targetList = null;

            if (e.keyCode == 39) {
                $targetList = getNextList($activeList);
            } else {
                $targetList = getPreviousList($activeList);
            }

            var $targetItem = matchItems($currently, $targetList);
            changeHoverItem($targetItem);

        };


        /**
         * @param {jQueryObject} $currently
         */
        var handleEnterKey = function($currently) {
            var value = $currently.find('a').data('value');
            if (value) {
                setSelectedTextToInput(value);
                config.onSelect && config.onSelect.call(this, $currently.find('a'));
                closeWrapper();
            }
        };


        /**
         * @param {jQueryObject} $item
         */
        var onFocus = function($item) {
            var value = $item.data('value');
            setTimeout(function() {
                value && $element.val($item.data('value')).focus();
            }, 100);
        };


        var bindKeyboardEvents = function(e) {
            if (config.visibleTime) {
                clearTimeout(visibleTimeOut);
            }

            if (listCount) {
                e.preventDefault();
            }

            var keyCode = e.keyCode;

            var keyHandlers = {
                38: handleUpKey,
                40: handleDownKey,
                39: handleLeftRightKey,
                37: handleLeftRightKey
                //13: handleEnterKey
            };

            if (keyHandlers[keyCode]) {
                $element.focus();
                keyHandlers[keyCode](getHoverItem(), e);
                config.onFocus && config.onFocus.call(this, getHoverItem().find('a'));

                if (config.visibleTime) {
                    visibleTimeOut = setTimeout(function() {
                        closeWrapper();
                    }, config.visibleTime);
                }

            }
        };


        /**
         * @type {Object}
         */
        var config = {
            delayTime: 500,
            visibleTime: 0,
            minLength: 3,
            itemPerList: 10,
            eventType: 'keyup',
            appendTo: null,
            label: null,
            value: null,
            proxy: null,
            renderItem: renderItem,
            onSelect: function() {},
            onFocus: onFocus,
            onOpen: function() {},
            onClose: function() {},
            onEnter: function() {}
        };

        $.extend(config, options);
        $appendTo = $(config.appendTo);


        /**
         *
         * @param {Object} e
         */
        var initialize = function(e) {
            clearTimeouts();
            var cancel = false;

            this.setAttribute('autocomplete', 'off');

            var value = $.trim(this.value),
                keyCode = e.keyCode,
                valueLength = value && value.length;

            if (config.eventType.toLowerCase().indexOf('keydown') != -1) {
                e.keyCode != 8 ? valueLength++ : valueLength--;
            }

            if (keyCode == 13) {
                config.onEnter && config.onEnter(value, config);
            }

            if (valueLength >= (config.minLength)) {

                if (keyCode >= 37 && keyCode <= 40) {
                    bindKeyboardEvents(e);
                    cancel = true;
                }

                if (!cancel) {
                    var processId = setTimeout(function() {
                        dataParser();
                        listCount = 0;
                    }, config.delayTime);
                }

                timeout.push(processId);
            } else {
                closeWrapper();
                clearSearchResult();
            }
        };


        $element
            .bind(config.eventType, initialize)
            .bind('blur', closeWrapper);

    };

})(jQuery);
