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

define(['products'], function() {
    'use strict';

    App.Models.CategorySelection = Backbone.Model.extend({
        defaults: {
            subCategory: -1,
            parentCategory: -1,
        }
    });

    /**
     * @class
     * @classdesc Represents category's products set.
     * @alias Backbone.Model
     * @augments Backbone.Model
     * @example
     * // create a category's products model
     * require(['models/category_products'], function() {
     *     var categoryProducts = new App.Models.categoryProducts({id: '1,2,3,4'});
     * });
     */
    App.Models.CategoryProducts = Backbone.Model.extend(
    /**
     * @lends Backbone.Model.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Products set's id. It may be category's id or search line.
             * @type {string}
             * @default ''
             */
            id: '',
            /**
             * Products request status ('pending', 'resolved').
             * @type {string}
             * @default 'pending'
             */
            status: 'pending',
            /**
             * Products set.
             * @type {?App.Collections.Products}
             * @default null
             */
            products: null
        },
        /**
         * Initializes `products` attribute as new instance of App.Collections.Products.
         */
        initialize: function() {
            this.set('products', new App.Collections.Products());
        }
    });

    /**
     * @class
     * @classdesc Represents products sets.
     * @alias Backbone.Collection
     * @augments Backbone.Collection
     * @example
     * // create a products sets
     * require(['models/category_products'], function() {
     *     var productsSets = new App.Collections.ProductsSets([{id: '1,2,3,4'}, {id: '1'}]y);
     * });
     */
    App.Collections.ProductsSets = Backbone.Collection.extend(
    /**
     * @lends Backbone.Collection.prototype
     */
    {
        /**
         * Item's constructor.
         * @type {Function}
         * @default App.Models.CategoryProducts
         */
        model: App.Models.CategoryProducts
    });
});