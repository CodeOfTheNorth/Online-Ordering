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
        events: {
            'input .quantity_edit_input': 'change'
        },
        initialize: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.options.model, 'combo_weight_product_change', this.combo_weight_product_change);
        },
        hide_show: function(isComboWithWeightProduct) {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            var product = this.model.get_product(),
                quantity = this.model.get('quantity'),
                selectable_amount = App.Settings.cannot_order_with_empty_inventory ? product.get('stock_amount') : product.get('max_stock_amount');

            if (selectable_amount === 1 || product.isParent() || isComboWithWeightProduct || this.model.isMatrixChildProductUpsell()) {
                this.$('.quantity_edit_input').addClass('disabled').prop('disabled', true);
                App.Settings.cannot_order_with_empty_inventory && this.model.set('quantity', 1); // bug 13494
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
        combo_weight_product_change: function(isComboWithWeightProduct) {
            if (isComboWithWeightProduct) {
                this.model.set('quantity', 1);
            }
            this.hide_show(isComboWithWeightProduct);
        },
        update: function() {
            this.$('.quantity_edit_input').val(this.model.get('quantity'));
        }
    });

    var QuantityWeightView = App.Views.CoreQuantityView.CoreQuantityWeightView.extend({
        bindings: {
            '.weight-wrapper': 'attr: {"data-weight": scalesFormat(weight)}'
        }
    });

    var QuantityMainCartView = QuantityMainView.extend({
        mod: 'main_cart',
        initialize: function() {
            QuantityMainView.prototype.initialize.apply(this, arguments);
            if (this.model.isComboBased() && (this.model.get('product').get('product_sets').haveWeightProduct() || this.model.get('product').get("sold_by_weight"))){
                QuantityMainView.prototype.combo_weight_product_change.call(this, true);
            }
        },
        bindings: {
            '.qty': 'text: quantity'
        }
    });

    var QuantityWeightCartView = App.Views.CoreQuantityView.CoreQuantityWeightView.extend({
        mod: 'weight_cart',
        bindings: {
            '.weight': 'text: integer(weight)'
        }
    });

    return new (require('factory'))(quantity_view.initViews.bind(quantity_view), function() {
        App.Views.QuantityView.QuantityMainView = QuantityMainView;
        App.Views.QuantityView.QuantityWeightView = QuantityWeightView;
        App.Views.QuantityView.QuantityMainCartView = QuantityMainCartView;
        App.Views.QuantityView.QuantityWeightCartView = QuantityWeightCartView;
    });
});