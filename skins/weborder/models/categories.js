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

define(['categories'], function(Backbone) {
    'use strict';

    var coreCategories = App.Collections.Categories,
        Categories = coreCategories.extend({
            /**
             * Set value of 'selected' property.
             * @param {Number} selected - Id of selected subcategory.
             * @param {boolean} [silent] - If not true, trigger 'change:selected' event.
             */
            setSelected: function(selected, silent) {
                this.selected = selected;
                if (!silent) {
                    this.trigger('change:selected', this, selected);
                }
            },
            setParentSelected: function(parent_selected) {
                if (this.parent_selected !== parent_selected) {
                    this.parent_selected = parent_selected;
                    this.trigger('change:parent_selected', this, parent_selected);
                }
            },
            getParentSelected: function() {
                var self = this;
                var category = this.find(function(model) {
                    return self.parent_selected && model.get('parent_name') === self.parent_selected;
                });
                return category ? {
                    parent_name: category.get('parent_name'),
                    parent_id: category.get('parent_id')
                } : undefined;
            }
        });

    App.Collections.Categories = Categories
});