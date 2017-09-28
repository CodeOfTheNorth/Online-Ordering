/*
 * Revel Systems Online Ordering Application
 *
 *  Copyright (C) 2014 by Revel Systems
 *
 * This file is part of Revel Systems Online Ordering open source application.
 *
 * Revel Systems Online Ordering open source application is free software: you
 * can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * Revel Systems Online Ordering open source application is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Revel Systems Online Ordering Application.
 * If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
    'use strict';
    if (is_browser_unsupported) {
        return;
    }

    /**
     * Object containing all available skins.
     * @typedef {object} module:app~Skins
     * @property {string} WEBORDER=weborder - The name of Weborder skin.
     * @property {string} WEBORDER_MOBILE=weborder_mobile - The name of Weborder Mobile skin.
     * @property {string} RETAIL=retail - The name of Retail skin.
     */
    // init `skins` object that contents all available skins
    var skins = Object.create(null, {
        set: {
            value: function(key, value, packagePath) {
                // add property that is constant
                Object.defineProperty(this, key, {
                    value: value,
                    enumerable: true
                });

                // set DEFAULT skin if it is not assigned
                if(typeof this.DEFAULT == 'undefined')
                    this.DEFAULT = value;

                // add available skin
                this.available.indexOf(value) == -1 && this.available.push(value);

                // need set package for skin
                require('app').config.packages.push({
                    name: value,
                    location: packagePath || 'skins/' + value
                });
            }
        },
        DEFAULT: {
            value: undefined,
            writable: true
        },
        available: {
            value: []
        }
    });

    /**
     * Main application namespace. All new entities should be added to this namespace.
     * @namespace App
     */
    window.App = {
        /**
         * Contains all available Collection constructors extending Backbone.Collection.
         * If you create a new collection constructor it should be added to App.Collections.
         * @namespace App.Collections
         */
        Collections: {},
        /**
         * Contains main application objects that define app structure,
         * instances of [models]{@link App.Models} , [collections]{@link App.Collections}
         * and helper data associated with the current app state.
         * If you create an instance of new entity and would like to get access to it in any part of code
         * you need to add it to App.Data.
         * @namespace App.Data
         */
        Data: {
            modifiers: {},
            myorder: {},
            orders: {},
            products: {},
            products_bunches: {},
            productSets: {},
            router: {},
            settings: {},
            taxes: {},
            paypal_iOS: /device=ios/.test(location.search),
            devMode: /dev=true/.test(location.search),
            devPath: /\/dev\//.test(location.href),
            nocache: /nocache=true/.test(location.search),
            reportBugNumber: /bug=[^#&]+/.test(location.search) ? location.search.match(/bug=([^#&]+)/)[1] : false,
            images: {},
            log: {},
            curLocale: 'en'
        },
        /**
         * Contains all available Model constructors extending Backbone.Model.
         * If you create a new model constructor it should be added to App.Models.
         * @namespace App.Models
         */
        Models: {},
        lastModelViews: {},
        /**
         * Contains all available Router constructors extending Backbone.Router.
         * If you create a new router constructor it should be added to App.Routers.
         * @namespace App.Routers
         */
        Routers: {},
        /**
         * Contains all available View constructors extending Backbone.View.
         * If you create a new view constructor it should be added to App.View.
         * @namespace App.Views
         */
        Views: {},
        /**
         * Contains all available skins.
         * @memberof App
         * @type module:app~Skins
         */
        Skins: skins,
        /**
         * Contains stand along functionalities for mixing with Views or Models.
         * @memberof App
         * @namespace App.Mixes
         */
        Mixes: {},
        /**
         * Contains all available controllers for managing some features needing in control several Views.
         * @memberof App
         * @namespace App.Controllers
         */
        Controllers: {}
    };

    /**
     * A short name for App.Data.settings.attributes.settings_system object.
     * @memberof App
     */
    App.Settings = {};

    if (App.Data.devMode) {
        App.dbgView = {};
    }

    var tmp_values = location.search.match(/trace=([^\&\#]+)/g) || [];
    App.Data.traceTags = tmp_values.map(function(m){ return m.replace('trace=', ''); });
    /**
     * A simple object factory for App.Models objects
     * @param {string} type_name - the subname of the object constructor to be used
     */
    App.Models.create = function(type_name) {
        return new App.Models[type_name]();
    }

    /**
     * A module representing the application.
     * @module app
     * @requires module:config
     * @see [actual path]{@link module:config.paths}
     */
    define(['config'], function(config) {
        return {
            /**
             * All available skins in the app.
             * @type {module:app~Skins}
             * @static
             */
            skins: skins,
            /**
             * Contains an object exported by [config]{@link module:config} module.
             * @type {module:config}
             * @static
             */
            config: config,
            init: init,
            /**
             * A function is called before the app init. If you want to do something before the app init need to override this function.
             * @type {Function}
             * @static
             * @method
             */
            beforeInit: new Function,
            /**
             * A function is called after the app init. If you want to do something after the app init need to override this function.
             * @type {Function}
             * @static
             * @method
             */
            afterInit: new Function,
            loadApp: loadApp // loading application
        }
    });

    /**
     * Inits and runs the app.
     * @alias module:app.init
     * @type {Function}
     * @static
     * @example
     * // load 'app' module and run the app
     * require(['app'], function('app') {
     *     app.init();
     * });
     */
    // start app
    function init() {
        var app = require('app');

        if(app.skins.available.length == 0)
            return alert('No skin is available. Please add at least one skin (need add skins.set(\'WEBORDER\', \'weborder\') in main.js).');

        if(!app.REVEL_HOST)
            return alert('REVEL_HOST is undefined. Please assign it in main.js file. (Need add app.REVEL_HOST = <url>;)');

        // set config for require
        require.config(app.config);

        require(['cssua', 'raven', 'functions', 'generator', 'errors', 'errors_view', 'myorder', 'settings', 'timetable', 'custom_menus', 'log', 'tax', 'main_router', 'locale'], function() {
            var win = Backbone.$(window);

            raven_init();

            App.Data.devMode && traceDeferredObjects();

            trace(">>>> Application starts .................");

            app.get = parse_get_params();

           /*
            * !IMPORTANT: Changing target Back-end server is done here:
            * You can use url params like srv=some_backend (i.e. https://some_frontend.revelup.com/weborder?srv=some_backened)
            * to redirect all data requests to some_backened.revelup.com
            * As well you can write the full server domain name e.g. srv=https://qa2.revelup.com or srv=qa2.revelup.com
            */
            if (app.get['srv'] && app.get['srv'].length > 0) {
                if (/^https:\/\//.test(app.get['srv'])) {
                    app.REVEL_HOST = app.get['srv'];
                } else if (/\./.test(app.get['srv'])) {
                    app.REVEL_HOST = "https://" + app.get['srv'];
                } else {
                    app.REVEL_HOST = "https://" + app.get['srv'] + ".revelup.com";
                }
            }

            // Add 'no-focus-css' class to [tabindex] element when user clicks on it.
            // This class is used for :focus CSS disabling.
            controlFocusCSS();

            App.Data.is_stanford_mode = false;
            if (app.get['stanford'] == 'true') {
                App.Data.is_stanford_mode = true;
            }
            // common initialization
            commonInit();

            // invoke beforeStart onfig
            app.beforeInit();

            App.Data.spinnerStartEvents = [];

            App.Data.getSpinnerSize = MainSpinner.getFontSize;
            // init spinner plugin
            createSpinnerPlugin();

            App.Data.spinnerEvents = [];
            win.on('hideSpinner', function(event, data) {
                trace({for: 'spinner'}, "win::hideSpinner =>");
                if (!data || !data.startEvent) {
                    data = {startEvent: EVENT.START};
                }
                //trace("win spinner Hide ==> ", data.startEvent);
                if (App.Data.spinnerEvents.indexOf(data.startEvent) >= 0){
                    App.Data.spinnerEvents = _.without(App.Data.spinnerEvents, data.startEvent);
                }

                if (data.isLastEvent) {
                    mainSpinnerEl.style.display = 'none';
                    return;
                }
                setTimeout( function() {
                    //#19303 we should wait in the case of a events series e.g. Start -> Navigate -> Search,
                    //only the last event (isLastEvent flag) should hide the spinner immediately.
                    if (App.Data.spinnerEvents.length == 0) {
                        mainSpinnerEl.style.display = 'none';
                    }
                }, 50);
            });
            win.on('showSpinner', function(evt, data) {
                trace({for: 'spinner'}, "win::showSpinner =>");
                if (!data || !data.startEvent) {
                    data = {startEvent: EVENT.START};
                }
                //trace("win spinner Show ==> ", data.startEvent);
                if (App.Data.spinnerEvents.indexOf(data.startEvent) == -1) {
                    App.Data.spinnerEvents.push(data.startEvent);
                }
                setTimeout( function() {
                    if (App.Data.spinnerEvents.indexOf(data.startEvent) >= 0) {
                        mainSpinnerEl.style.display = 'block';
                    }
                }, 50);
            });

            // init errors object and check browser version
            var errors = App.Data.errors = new App.Models.Errors;
            errors.on('alertMessage', App.Routers.MainRouter.prototype.alertMessage); // user notification

            // init log object and listen to ajax errors
            App.Data.log = new App.Models.Log({init: window.initErrors});
            App.Data.ajax_errors_count = 0;
            $(document).ajaxError(function(e, jqxhr, settings, exception) {
                //App.Data.log.pushAjaxError(settings.url, jqxhr.state(), exception.toString()); // no reason to push it to GA now
                if (!/customers-auth/.test(settings.url)) {
                    trace(e.type, settings.url, jqxhr.status, jqxhr.statusText);
                    App.Data.ajax_errors_count++;
                }
            });

            // init settings object
            var settings = App.Data.settings = new App.Models.Settings({
                supported_skins: app.skins.available });

            trace_restore_log();

            var locale = App.Data.locale = new App.Models.Locale,
                isNotFirstLaunch = false;

            // if `storage_data` attribute isn't the web storage need to show a message
            // that blocks further the app initialization
            if (settings.get('storage_data') !== 1) {
                return errors.alert(ERROR.WEBSTORAGES_ARE_DISABLED, true);
            }

            App.Data.isNewWnd = !!getData("is_new_window");

            settings.on('change:settings_system', function(model, value)
            {
                var favicon_image = (value.favicon_image !== null) ? value.favicon_image : '/favicon.ico';
                document.getElementById('favicon').href = favicon_image + '?t=' + Date.now();
            });

            settings.on('change:skin', function() {
                trace({for: 'start'}, 'app:init() change:skin ==>');
                locale.dfd_load = locale.loadLanguagePack(); // load a language pack from backend
                locale.dfd_load.done(function() {
                    _loc = locale.toJSON();
                    _.extend(ERROR, _loc.ERRORS);
                    _.extend(MSG, _loc.MSG);
                    delete _loc.ERRORS;
                    delete _loc.MSG;
                    $(window).trigger('LocalizationCompleted');
                });
                locale.on('showError', function() {
                    errors.alert(ERROR.LOAD_LANGUAGE_PACK, true); // user notification
                });
            });

            settings.on('changeSettingsSkin', function() {
                trace({for: 'start'}, 'app:init() change:changeSettingsSkin ==>');
                load_styles_and_scripts(); // load styles and scripts
                var myorder = App.Data.myorder = new App.Collections.Myorders;

                require([settings.get('skin') + '/router'], function(module) {
                    Backbone.$.when(locale.dfd_load, settings.loadDfd).then(function() {
                        App.Data.timetables = new App.Models.Timetable;
                        App.Data.custom_menus = new App.Collections.CustomMenus;
                        App.Data.custom_menus.addJSON(App.Settings.custom_menus);
                        if(module instanceof require('main_router')) {
                            module.initRouter();
                        }
                        var router = App.Data.router = new App.Routers.Router;
                        router.once('started', function() {
                            // hide a launch spinner & load an establishments list
                            win.trigger('hideSpinner');
                            router.trigger('needLoadEstablishments');
                        });

                        if (settings.get('isMaintenance')) {
                            if (!settings.get('maintenanceMessage')) {
                                settings.set('maintenanceMessage', MAINTENANCE.BACKEND_CONFIGURATION); // default error message
                            }
                            location.replace('#maintenance');// need use replace to avoid entry "#" -> "#maintenance" in browser history
                        } else {
                            // TODO: shouldn't depend on the isMaintenance mode if the 'Change Store' functionality is implemented on '#maintenance' page
                            isNotFirstLaunch = true;
                        }
                        router.isNotFirstLaunch = isNotFirstLaunch;
                        Backbone.history.start();

                        // invoke afterStart callback
                        app.afterInit();
                    });
                });
                myorder.on('reset add remove', function() {
                    var ests = App.Data.establishments;
                    if (ests) ests.needShowAlert(myorder.get_only_product_quantity() > 0);
                });
                myorder.trigger('reset'); //#21756, should be reset after est. changed
            });
            app.loadApp(); // loading application
        });
    }

    function createSpinnerPlugin() {
        // jquery `spinner` plugin
        $.fn.spinner = function(options) {
            var self = this;
            trace({for: 'spinner'}, "$.fn.spinner add");
            this.each( MainSpinner.addSpinner );
            if (App.Data.is_stanford_mode) {
                this.find(".ui-spinner").addClass("stanford");
            }
            if (options && options.deferred) {
                this.resourceSpinner = this.find('.ui-spinner');
                options.deferred.always(function() {
                    trace({for: 'spinner'}, "$.fn.spinner remove");
                    self.resourceSpinner.remove();
                    delete self.resourceSpinner;
                })
            }
        };
    }

    /**
     * Defines the current establishment id and reloads the app according its value.
     * @memberof module:app
     * @type {Function}
     * @static
     */
    function loadApp() {
        require(['establishments', 'establishments_view'], function() {
            trace({for: 'start'}, 'loadApp() establishments ==>');
            /**
             * App reported about error.
             */
            function showError() {
                App.Data.errors.alert(MSG.ESTABLISHMENTS_ERROR_NOSTORE, true); // user notification
                win.trigger('hideSpinner');
            };
            var settings = App.Data.settings,
                ests = App.Data.establishments = new App.Collections.Establishments(),
                win = Backbone.$(window);
            ests.setViewVersion(settings.isMobileVersion()); // set a view version (desktop or mobile)
            ests.listenTo(settings, 'change:brand', function() {
                ests.meta('brand', settings.get('brand'));
            });
            ests.on('loadStoresList', App.Routers.MainRouter.prototype.loadViewEstablishments.bind(window)); // status code = 1 (app should load view with stores list)
            ests.on('showError', showError); // status code = 2 (app reported about error)
            ests.on('changeEstablishment', function(estID) {
                trace({for: 'start'}, 'loadApp() changeEstablishment ==>');
                // Need stop execution if establishment id is same.
                // It's important for restoring from session history.
                if(settings.get('establishment') == estID) {
                    return;
                }

                ests.trigger('resetEstablishmentData');
                win.trigger('showSpinner');
                App.Views.GeneratorView.clearCache(); // clear cache if store was changed
                settings.set('establishment', estID);
            }); // status code = 3 (app was loaded)
            ests.checkGETParameters(settings.get_establishment());
        });
    }

    /**
     * Adds 'no-focus-css' class to [tabindex] element.
     * This class can be used to disable CSS for [tabindex]:focus elements.
     *
     * We should apply some CSS for [tabindex] elements to highlight them in navigation via TAB button.
     * But need to get rid of ':focus' CSS application when user clicks on the [tabindex] element
     * because it gains the focus.
     */
    function controlFocusCSS() {
        Backbone.$(document.documentElement).on('mousedown', '[tabindex]', function(event) {
            var el = Backbone.$(event.currentTarget),
                className = 'no-focus-css';

            // add 'className'
            el.addClass(className);
            el.one('blur', el.removeClass.bind(el, className));
        });
    }

    /**
     *  Set common cross core/dev subprojects initilizations here
     */
    function commonInit() {
        /*
        *   Factory of controllers
        */
        App.Data.ctrlCache = {};
        App.Data.controllers = {
            create: function(ctrlName, id) {
                if (!App.Controllers[ctrlName]) {
                    console.error("Can't find App.Controllers." + ctrlName);
                    return;
                }
                var ctrl = new App.Controllers[ctrlName];
                var cache_id = cache_id ? cache_id : ctrlName;
                App.Data.ctrlCache[cache_id] = ctrl;
                return ctrl;
            },
            get: function(id) {
                return App.Data.ctrlCache[id];
            }
        };
    }
})();
