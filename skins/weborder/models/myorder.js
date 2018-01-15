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

define(["backbone", 'products'], function(Backbone) {
    'use strict';

    App.Models.Myorder = App.Models.Myorder.extend({
        time_changed: function() {
            if (!this.collection || this.collection.models.length == 0) {
                return;
            }

            var product_order_id,
                products_remove = [],
                list = [];
            var collection = App.Data.myorder;

            collection.models.forEach(function(model) {
                product_order_id = model.get_product().get('id');
                for (var i in App.Data.products) {
                    var products = App.Data.products[i];
                    var found = products.get_product(product_order_id);
                    if (found && !found.get('schedule').available()) {
                        products_remove.push(model);
                        list.push(found.get('name'));
                        break;
                    }
                };
            });

            for (var i in products_remove) {
                collection.remove(products_remove[i]);
            }

            if (list.length > 0) {
                App.Data.errors.alert(
                    (list.length == 1 ?
                    _loc.PRODUCT_REMOVED_FROM_ORDER :
                    _loc.PRODUCTS_REMOVED_FROM_ORDER + '<br>') +
                    list.join('<br>'));
            }
        }
    });
});

