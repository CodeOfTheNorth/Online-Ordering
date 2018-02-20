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

define(["quantity_view"], function(quantity_view) {
    'use strict';

    var QuantityMainView = App.Views.CoreQuantityView.CoreQuantityMainView.extend({
        bindings: {
            '.title': 'attr: {"data-qty": quantity}'
        },
        events: {
            'input .quantity_edit_input': 'change'
        },
        hide_show: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            var product = this.model.get_product(),
                quantity = this.model.get('quantity'),
                forbidNegativeInventory = App.Settings.cannot_order_with_empty_inventory,
                selectable_amount = forbidNegativeInventory ? product.get('stock_amount') : product.get('max_stock_amount');

            // need hide quantity widget if parent product is selected
            if(product.isParent())
                return this.$el.hide();

            if (selectable_amount === 1 || this.model.isMatrixChildProductUpsell()) {
                this.$('.quantity_edit_input').addClass('disabled').prop('disabled', true);
                forbidNegativeInventory && this.model.set('quantity', 1); // bug 13494
            } else {
                if (quantity > 1) {
                    this.$('.decrease').removeClass('disabled');
                }
                if (quantity < selectable_amount) {
                    this.$('.increase').removeClass('disabled');
                }
                this.$('.quantity_edit_input').removeClass('disabled').prop('disabled', false);
            }
        },
        change: function(e) {
            var max = App.Settings.cannot_order_with_empty_inventory ? this.model.get_product().get('stock_amount')
                : this.model.get_product().get('max_stock_amount');
            if (e.target.value > max) {
                e.target.value = max;
            } else {
                this.model.set('quantity', e.target.value * 1);
            }

            if (e.target.value)  {
                this.model.set('quantity', e.target.value * 1);
            }
        },
        update: function() {
            this.$('.quantity_edit_input').val(this.model.get('quantity'));
        }
    });

    var QuantityWeightView = App.Views.CoreQuantityView.CoreQuantityWeightView.extend({
        bindings: {
            '.weight_edit_inner': 'attr: {"data-weight": scalesFormat(weight)}',
            '.title': 'attr: {"data-qty": quantity}'
        }
    });

    return new (require('factory'))(quantity_view.initViews.bind(quantity_view), function() {
        App.Views.QuantityView.QuantityMainView = QuantityMainView;
        App.Views.QuantityView.QuantityWeightView = QuantityWeightView;
    });
});