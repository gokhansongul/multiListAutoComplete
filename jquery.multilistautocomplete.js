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
         * @private
         */
        var renderItem = function(item) {
            var $li = $('<li></li>').addClass('autocomplete-search-item');

            var $a = $('<a></a>').appendTo($li);

            $a.data('value', item[config.value]);
            $a.data('label', item[config.label]);

            $a.html(item[config.label]);

            $a.bind('click', function() {
                setSelectedTextToInput(item[config.value]);
                item.element = this;

                config.onSelect && config.onSelect(item);
            });

            return $li;
        };


        /**
         *
         * @param {string} text
         * @private
         */
        var setSelectedTextToInput = function(text) {
            $element.val(text).focus();
        };


        /**
         *
         * @return {jQueryObject}
         * @private
         */
        var createListDom = function() {
            return $('<ul></ul>')
                    .addClass('autocomplete')
                    .addClass('list-' + listCount)
                    .appendTo(config.appendTo);
        };


        /**
         *
         * @private
         */
        var clearSearchResult = function() {
            $appendTo.find('ul.autocomplete').remove();
        };


        /**
         *
         * @private
         */
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
         * @return {jQueryObject}
         */
        var getListOfHoverItem = function() {
            return getHoverItem().parents('ul.autocomplete');
        };


        /**
         *
         * @param {jQueryObject}
         * @private
         */
        var changeHoverItem = function($item) {
            var $currently = getHoverItem();
            $currently.removeClass('state-hover');

            $item.addClass('state-hover');
        };


        /**
         *
         * @param {jQueryObject} $currently
         * @private
         */
        var handleDownKey = function($currently) {
            if (!$appendTo.is(':visible')) {
                openWrapper();
            }

            if (!$currently.length) {
                var $firstItem = $appendTo.find('ul.autocomplete').find('li').eq(0);
                changeHoverItem($firstItem);

            } else {
                var $target = $currently.next();
                if (!$target.length) {
                    $target = $currently.parent().find('li').first();
                }

                changeHoverItem($target);
            }
        };


        /**
         *
         * @param {jQueryObject} $currently
         * @private
         */
        var handleUpKey = function($currently) {
            var $target = $currently.prev();

            if (!$target.length) {
                $target = $currently.parent().find('li').last();
            }

            changeHoverItem($target);
        };


        /**
         *
         * @param {jQueryObject}
         * @private
         */
        var handleRightKey = function($currently) {
            var $target = $currently.next();
            if (!$target.length) {
                $target = $appendTo.find('ul.autocomplete').eq(0);
            }

            changeHoverItem($target.find('li').eq(0));
        };


        /**
         *
         * @param {jQueryObject}
         * @private
         */
        var handleLeftKey = function($currently) {
            var $target = $currently.prev();
            if (!$target.length) {
                $target = $appendTo.find('ul.autocomplete').last();
            }

            changeHoverItem($target.find('li').eq(0));
        };


        /**
         *
         * @param {jQueryObject}
         * @private
         */
        var handleEnterKey = function($currently) {
            var value = $currently.find('a').data('value');
            if (value) {
                setSelectedTextToInput(value);
                closeWrapper();
                config.onSelect && config.onSelect($currently);
            }
        };


        var bindKeyboardEvents = function(e) {
            clearTimeout(visibleTimeOut);

            var $currently = null;
            var keyCode = e.keyCode;

            var keyHandlers = {
                38: handleUpKey,
                40: handleDownKey,
                39: handleRightKey,
                37: handleLeftKey,
                13: handleEnterKey
            };

            if (keyCode == 38 ||  keyCode == 40 || keyCode == 13) {
                $currently = getHoverItem();
            } else if (keyCode == 37 || keyCode == 39) {
                $currently = getListOfHoverItem();

                if (listCount == 1) {
                    return false;
                }
            }

            if (keyHandlers[keyCode]) {
                keyHandlers[keyCode]($currently);

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
            onSelect: null,
            onOpen: null,
            onClose: null
        };

        $.extend(config, options);
        $appendTo = $(config.appendTo);


        /**
         *
         * @param {Object} e
         */
        var initialize = function(e) {
            clearTimeouts();
            var value = $.trim(this.value);
            var keyCode = e.keyCode;

            if (value && value.length >= config.minLength && value == 'merh') {

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
