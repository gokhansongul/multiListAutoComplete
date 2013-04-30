(function($) {

    /**
     * @param {Object} options
     */
    $.fn.multiListAutoComplete = function(options){
        var $element = $(this);

        /**
         * @type {Object}
         */
        var config = {
            proxy: this.proxy,
            listCount: 1,
            delayTime: 500,
            minLength: 3,
            itemPerList: 10,
            onSelect: this.onSelect,
            eventType: 'keydown'
        };

        $element.bind(config.eventType, function() {
            debugger;
        });

    };
})(jQuery);
