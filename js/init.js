
/**
 * Get GET-parameters from address line.
 */
function parse_get_params() {
    // need to include app.instances config as origin parameters
    // if no one GET-parameter exists in url (Bug 32709)
    if (!window.location.search && !parse_get_params.instance_config_applied) {
        try {
            var app = require('app');
            if(app.REVEL_HOST in app.instances) {
                var instance_params = app.instances[app.REVEL_HOST];
            }
            if(window.$_GET) {
                window.$_GET = _.extend({}, instance_params, window.$_GET);
            }
            parse_get_params.instance_config_applied = true;
        } catch(e) {
            console.log(e)
        }
    }
    // return if string was already parsed
    if (window.$_GET) {
        return window.$_GET;
    }

    $_GET = {};
    // Mercury return url is not xml-decoded
    var search = window.location.search.replace(/&amp;/g, '&');
    var __GET = search.substring(1).split("&");
    for (var i = 0; i < __GET.length; i++) {
        var get_var = __GET[i].split("=");
        $_GET[get_var[0]] = typeof(get_var[1]) == "undefined" ? "" : get_var[1];
    }
    if (typeof instance_params == 'object') {
        $_GET = _.extend({}, instance_params, $_GET);
    }
    return $_GET;
}

    function MainSpinner() {
	}

    // show spinner when App is initializing and init jquery `spinner` plugin
    MainSpinner.prototype.initSpinner = function() {
        var nodes = document.querySelectorAll('html, body');
        var i = 0;
        for (; i < nodes.length; i++) {
            nodes[i].style.width = '100%';
            nodes[i].style.height = '100%';
            nodes[i].style.margin = '0';
        }

        document.querySelector('body').innerHTML = '<div class="ui-loader-default" style="width: 100%; height: 100%; font-size:' + MainSpinner.getFontSize() + 'px !important" id="loader"></div>';
        var loader = document.querySelector('#loader');
        MainSpinner.addSpinner.call(loader);
        loader.style.cssText += "background-color: rgba(170, 170, 170, .8); position: absolute;";

        if (/stanford=true/.test(window.location.search)) {
            document.querySelector('.ui-spinner').classList.add("stanford");
        }

        return loader;
    }
   /**
     * Appends a spinner to html element. 'this' keyword value should be an HTMLElement instance.
     * @memberof module:app
     * @type {Function}
     * @static
     * @example
     * // load 'app' module and add spinner to `body` element
     * require(['app'], function('app') {
     *     app.addSpinnder.call(document.body);
     * });
     */
    //implemented as static method:
    MainSpinner.addSpinner = function() {
        var html = '<div class="ui-spinner animate-spin"></div>';
        if('absolute' !== this.style.position) {
            this.style.position = 'relative';
        }
        this.innerHTML += html;
    }

    /**
     * Calculates a font size based on client size. This value affects CSS sizes in `em` units.
     * @memberof module:app
     * @type {Function}
     * @static
     * @example
     * // load 'app' module and set a font size to `body` element
     * require(['app'], function('app') {
     *     var fontSize = app.getFontSize(document.body);
     *     document.body.style.fontSize = fontSize + 'px';
     * });
     * @returns {number} base font size
     */
    // define font-size for spinner
    MainSpinner.getFontSize = function() {
        var wCoef = document.documentElement.clientWidth / 640,
            hCoef = document.documentElement.clientHeight / 700,
            baseSize = 12;

        if (wCoef > hCoef)
            return Math.round(hCoef * baseSize * 1.5);
        else
            return Math.round(wCoef * baseSize * 1.5);
    }