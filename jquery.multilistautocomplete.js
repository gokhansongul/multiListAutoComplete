(function($) {

    /**
     * @param {Object} options
     */
    $.fn.multiListAutoComplete = function(options){
        var $element = $(this);
        var that = this;

        if (!options || (options.proxy && typeof options.proxy != 'function')) {
            throw 'Error!';
        }

        /**
         * @type {Object}
         */
        var config = {
            listCount: 1,
            delayTime: 500,
            minLength: 3,
            itemPerList: 10,
            onSelect: this.onSelect,
            eventType: 'keydown'
        };

        $.extend(config, options);

        $element.bind(config.eventType, function() {
            setTimeout(function() {
                var value = $.trim($element.val());
                if (value && value.length >= config.minLength) {
                    that.init();
                }
            }, config.delayTime);
        });

        this.init = function() {
            var data = config.proxy(this.value);


        };

    };
})(jQuery);
