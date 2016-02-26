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

/**
 * Contains {@link App.Models.AboutModel} constructor.
 * @module about
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(['backbone'], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a model data of "About" section of the app.
     * @alias App.Models.AboutModel
     * @augments Backbone.Model
     * @example
     * // create a 'about' model
     * require(['about'], function() {
     *     var abountModel = new App.Models.AboutModel();
     * });
     */
    App.Models.AboutModel = Backbone.Model.extend(
        /**
         * @lends App.Models.AboutModel.prototype
         */
        {
        /**
         * Sets values for attributes: `images`, `title`, `content`, `curImageIndex`.
         */
        initialize: function() {
            var images = App.Settings.about_images,
                host = App.Data.settings.get('host');

            if (App.Settings.logo_img) {
                images.unshift(App.Settings.logo_img);
            }
            images = images.map(function(src) {
                var img = $('<img src="' + (App.unitTest ? src : addHost(src, host)) +'">');
                return loadSpinner(img, true);
            });
            this.set('images', images);
            this.set('title', App.Data.settings.get('settings_system').about_title);

            var descr = App.Data.settings.get('settings_system').about_description;
            descr = descr ? descr.replace(/\r\n/g,"<br>") : "";

            this.set('content', descr);
            this.set('curImageIndex', 0);
        }
    });
});