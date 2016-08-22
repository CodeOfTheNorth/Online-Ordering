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
 * Contains {@link App.Models.Search}, {@link App.Collections.Search}, {@link App.Models.SearchLine} constructors.
 * @module search
 * @requires module:products
 * @see {@link module:config.paths actual path}
 */
define(['products'], function() {
    'use strict';

    /**
     * @class
     * @classdesc Represents a model for producs lookup.
     * @alias App.Models.Search
     * @augments Backbone.Model
     * @example
     * // create a search model
     * require(['search'], function() {
     *     var search = new App.Models.Search();
     * });
     */
    App.Models.Search = Backbone.Model.extend(
    /**
     * @lends App.Models.Search.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Lookup string.
             * @type {?string}
             * @default null
             */
            pattern: null,
            /**
             * Found products.
             * @type {?App.Collections.Products}
             * @default null
             */
            products: null,
            /**
             * Found products.
             * @type {?Backbone.$.Deferred}
             * @default null
             */
            status: null,
            /**
             * Number of pages (per App.SettingsDirectory.json_page_limit) can be loaded for the search pattern.
             * @type {number}
             * @default 0
             */
            num_pages: 0,
            /**
             * Current page index (starting from 1) currently loaded.
             * @type {number}
             * @default 0
             */
            cur_page: 0,
            /**
             * Number of products can be loaded for the search pattern.
             * @type {number}
             * @default 0
             */
            num_of_products: 0,
            /**
             * Last products page loaded sucessfully. It can only grow up, needed for accessing to caching pages.
             * @type {number}
             * @default 0
             */
            last_page_loaded: 0
        },
        /**
         * Seeks products that match `pattern` attribute value.
         * @returns {Object} Deferred object.
         */
        get_products: function(options) {
            var self = this, cur_page, load,
                pattern = this.get('pattern'),
                start_index = _.isObject(options) ? options.start_index : 0,
                tmp_col = new App.Collections.Products;

            tmp_col.onProductsError = function() {
                App.Data.errors.alert(MSG.PRODUCTS_EMPTY_RESULT);
            }

            cur_page = parseInt(start_index / App.SettingsDirectory.json_page_limit) + 1;
            if (this.get('last_page_loaded') >= cur_page) {
                load = $.Deferred().resolve();
            } else {
                load = tmp_col.get_products(undefined, {search: pattern, page: cur_page}).done(function() {
                    if (!self.get('products')) {
                       self.set({products: new App.Collections.Products});
                    }
                    self.get('products').add(tmp_col.models);
                    self.set({
                        num_pages: tmp_col.meta.num_pages,
                        cur_page: cur_page,
                        num_of_products: tmp_col.meta.count,
                        last_page_loaded: cur_page
                    });
                });
            }

            this.set('status', load);
            return load;
        }
    });

    /**
     * @class
     * @classdesc Represents a collection of producs lookups. Keeps all lookups results.
     * @alias App.Collections.Search
     * @augments Backbone.Collection
     * @example
     * // create a search model
     * require(['search'], function() {
     *     var search = new App.Collections.Search();
     * });
     */
    App.Collections.Search = Backbone.Collection.extend(
    /**
     * @lends App.Collections.Search.prototype
     */
    {
        /**
         * Item constructor.
         * @type {Function}
         * @default {App.Models.Search}
         */
        model: App.Models.Search,
        /**
         * Sets a listener on 'onSearchComplete' event
         * to update {@link App.Collections.Search#lastPattern lastPattern} property.
         */
        initialize: function() {
            this.listenTo(this, 'onSearchComplete', this.setLastPattern, this);
        },
        /**
         * Updates {@link App.Collections.Search#lastPattern lastPattern} property.
         * @param {App.Models.Search} result - last performed search model.
         */
        setLastPattern: function(result) {
            if(!(result instanceof App.Models.Search)) {
                return;
            }
            /**
             * Last performed lookup string.
             * @alias lastPattern
             * @memberof! App.Collections.Search#
             * @type {string}
             */
            this.lastPattern = result.get('pattern');
        },
        /**
         * Clears {@link App.Collections.Search#lastPattern lastPattern} property.
         */
        clearLastPattern: function() {
            this.lastPattern = '';
        },
        /**
         * Performs search.
         * @param {string} pattern - lookup string
         */
        search: function(pattern) {
            var cache = this.where({pattern: pattern});
            if (cache.length && cache[0].get('completed') == undefined) {
                return this;
            }
            /**
             * Status of searching ('searchStart', 'searchComplete').
             * @alias status
             * @memberof! App.Collections.Search#
             * @type {string}
             */
            this.status = 'searchStart';
            if(cache.length > 0) {
                this.status = 'searchComplete';
            }
            this.trigger('onSearchStart');
            if(cache.length > 0) {
                return this.trigger('onSearchComplete', cache[0]);
            }

            var search = new App.Models.Search({pattern: pattern}),
                self = this;

            this.add(search);
            search.get_products().always(function() {
                search.set('completed', true, {silent: true});
                self.status = 'searchComplete';
                self.trigger('onSearchComplete', search);
            });
        }
    });

    /**
     * @class
     * @classdesc Represents a model of search UI.
     * @alias App.Models.SearchLine
     * @augments Backbone.Epoxy.Model
     * @example
     * // create a search model
     * require(['search'], function() {
     *     var searchCtrl = new App.Models.SearchLine();
     * });
     */
    App.Models.SearchLine = Backbone.Epoxy.Model.extend(
    /**
     * @lends App.Models.SearchLine.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {Object}
         * @enum
         */
        defaults: {
            /**
             * Search string.
             * @type {string}
             * @default ''
             */
            searchString: '',
            /**
             * Dummy string. It's used as 'empty' value for binding.
             * @type {string}
             * @default ''
             */
            dummyString: '',
            /**
             * Indicates whether the search line is collapsed.
             * @type {boolean}
             * @default true
             */
            collapsed: true,
            /**
             * Search collection.
             * @type {?App.Collections.Search}
             * @default null
             */
            search: null
        },
        /**
         * Adds listener on 'change:searchString' to perform a search.
         */
        initialize: function() {
            this.listenTo(this, 'change:searchString', this.updateSearch, this);
        },
        /**
         * Performs a search by `searchString` attribute value.
         */
        updateSearch: function() {
            var searchCollection = this.get('search');

            if (this.get('searchString')) {
                searchCollection.search(this.get('searchString'));
            } else {
                searchCollection.trigger('onSearchComplete', new Backbone.Model());
            }
        },
        /**
         * Clears `searchString`, `dummyString` attributes.
         */
        empty_search_line: function() {
            this.set({
                dummyString: '',
                collapsed: true
            });
            this.set('searchString', '');
        },
        /**
         * @returns {App.Models.Search} Search model.
         */
        getSearchModel: function() {
            var searchCollection = this.get('search'),
                searchString = this.get('searchString');
            return searchCollection && searchString && searchCollection.findWhere({pattern: searchString});
        }
    });
});