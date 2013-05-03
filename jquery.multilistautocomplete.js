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
         *
         * @type {jQueryObject}
         */
        var $element = $(this);


        /**
         *
         * @type {null|jQueryObject}
         */
        var $appendTo = null;


        /**
         *
         * @type {Array.<number>}
         */
        var timeout = [];


        /**
         *
         * @type {number}
         */
        var listCount = 0;


        /**
         *
         * @type {Number}
         */
        var visibleTimeOut = 0;


        var dataParser = function() {
            var data = config.proxy($element.val());
            if (data && data['list']) {
                clearSearchResult();

                for (var i in data['list']) {
                    listCount++;
                    var list = data['list'][i];

                    if (list && $.isArray(list)) {
                        var $listDOM = createListDom();

                        for (var x = 0; x < list.length; x++) {
                            var listSearchItem = list[x];
                            $listDOM.append(config.renderItem(listSearchItem));
                        }
                    }
                }
                openWrapper();
            }
        };


        /**
         *
         * @param {Object} item
         * @return {jQueryObject}
         */
        var renderItem = function(item) {
            var $li = $('<li></li>').addClass('autocomplete-search-item');

            var $a = $('<a></a>').appendTo($li);

            $a
                .data('value', item[config.value])
                .data('label', item[config.label])
                .html(item[config.label])
                .bind('click', function() {
                    setSelectedTextToInput(item[config.value]);
                    item.element = this;

                    config.onSelect && config.onSelect(item);
                });

            return $li;
        };


        /**
         *
         * @param {string} text
         */
        var setSelectedTextToInput = function(text) {
            $element.val(text).focus();
        };


        /**
         *
         * @return {jQueryObject}
         */
        var createListDom = function() {
            return $('<ul></ul>')
                    .addClass('autocomplete')
                    .addClass('list-' + listCount)
                    .appendTo(config.appendTo);
        };


        var clearSearchResult = function() {
            $appendTo.find('ul.autocomplete').remove();
        };


        var openWrapper = function() {
            $appendTo.show(config.delayTime, config.onOpen);

            visibleTimeOut = setTimeout(function() {
                closeWrapper();
            }, config.visibleTime);
        };


        var closeWrapper = function() {
            $appendTo.hide(config.delayTime, config.onClose);
        };


        var clearTimeouts = function() {
            for (var i = 0; i < timeout.length; i++) {
                clearTimeout(timeout[i]);
            }
        };


        /**
         *
         * @return {jQueryObject}
         */
        var getHoverItem = function() {
            var $li = $appendTo.find('ul.autocomplete').find('li');
            var $hover = $li.filter('.state-hover');

            return $hover;
        };


        /**
         *
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

            return $item.parents('ul.autocomplete');
        };


        /**
         *
         * @param {jQueryObject}
         */
        var changeHoverItem = function($item) {
            var $currently = getHoverItem();
            $currently.removeClass('state-hover');

            $item.addClass('state-hover');
        };


        /**
         *
         * @param {jQueryObject} $list
         * @return {jQueryObject}
         */
        var getNextList = function($list) {
            if (!$list || !$list.length) {
                $list = getListOfHoverItem();
            }

            var $target = $list.next();
            if (!$target.length) {
                $target = $list.parent().find('ul.autocomplete').first();
            }

            return $target;
        };


        /**
         *
         * @param {jQueryObject} $list
         */
        var getPreviousList = function($list) {
            if (!$list || !$list.length) {
                $list = getListOfHoverItem();
            }

            var $target = $list.prev();
            if (!$target.length) {
                $target = $list.parent().find('ul.autocomplete').last();
            }

            return $target;
        };


        /**
         *
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
         *
         * @param {jQueryObject} $currently
         */
        var handleDownKey = function($currently) {
            if (!$appendTo.is(':visible')) {
                openWrapper();
            }

            if (!$currently.length) {
                var $firstItem = $appendTo.find('ul.autocomplete').find('li').first();
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
         *
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
         *
         * @param {jQueryObject}
         * @param {Object} e
         */
        var handleLeftRightKey = function($currently, e) {
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
         *
         * @param {jQueryObject}
         */
        var handleEnterKey = function($currently) {
            var value = $currently.find('a').data('value');
            if (value) {
                setSelectedTextToInput(value);
                config.onSelect && config.onSelect($currently);
                closeWrapper();
            }
        };


        var bindKeyboardEvents = function(e) {
            clearTimeout(visibleTimeOut);

            var keyCode = e.keyCode;

            var keyHandlers = {
                38: handleUpKey,
                40: handleDownKey,
                39: handleLeftRightKey,
                37: handleLeftRightKey,
                13: handleEnterKey
            };

            if ((keyCode == 37 || keyCode == 39) && listCount == 1) {
                return false;
            }

            if (keyHandlers[keyCode]) {
                $element.focus();
                keyHandlers[keyCode](getHoverItem(), e);
                config.onFocus && config.onFocus(getHoverItem());

                visibleTimeOut = setTimeout(function() {
                    closeWrapper();
                }, config.visibleTime);
            }
        };


        /**
         * @type {Object}
         */
        var config = {
            delayTime: 500,
            visibleTime: 10000,
            minLength: 3,
            itemPerList: 10,
            eventType: 'keyup',
            appendTo: null,
            label: null,
            value: null,
            proxy: null,
            renderItem: renderItem,
            onSelect: function() {},
            onFocus: function() {},
            onOpen: function() {},
            onClose: function() {}
        };

        $.extend(config, options);
        $appendTo = $(config.appendTo);


        /**
         *
         * @param {Object} e
         */
        var initialize = function(e) {
            clearTimeouts();

            var value = $.trim(this.value),
                keyCode = e.keyCode,
                minLength = config.minLength;

            if (config.eventType.toLowerCase() == 'keydown') {
                minLength -= 2;

                if (e.keyCode == 8) {
                    minLength = config.minLength + 1;
                }
            }

            if (value && value.length >= (minLength)) {

                if ((keyCode >= 37 && keyCode <= 40) || keyCode == 13) {
                    bindKeyboardEvents(e);
                    return false;
                }

                var processId = setTimeout(function() {
                                    dataParser();
                                    listCount = 0;
                                }, config.delayTime);

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
