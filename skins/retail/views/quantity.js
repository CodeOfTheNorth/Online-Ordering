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
            'change input': 'change'
        },

        combobox: null,

        hide_show: function() {
            App.Views.CoreQuantityView.CoreQuantityMainView.prototype.hide_show.apply(this, arguments);
            var select = this.$('select'),
                product = this.model.get_product(),
                quantity = this.model.get('quantity'),
                stock_amount = product.get('stock_amount'),
                selectWrapper = this.$('.combobox-wrapper'),
                max_amount = product.get('max_stock_amount');

            // need hide quantity widget if parent product is selected
            if(product.isParent())
                return this.$el.hide();

            max_amount > 0 && select.empty();
            var options = [];
            for (var i = 1; i <= max_amount; i++) {
                if (i === quantity) {
                    options.push('<option selected="selected" value="' + i + '">' + i + '</option>');
                } else {
                    options.push('<option value="' + i + '">' + i + '</option>');
                }
            }
            select.append(options);

            if (stock_amount === 1) {
                select.addClass('disabled');
                select.prop('disabled', true);
                selectWrapper.addClass('disabled');
            } else {
                select.removeClass('disabled');
                select.prop('disabled', false);
                selectWrapper.removeClass('disabled');
            }

            if (this.combobox) {
                this.combobox.destroy();
            }
            this.combobox = select.combobox(1, max_amount);
        },
        change: function(e) {
            this.model.set('quantity', e.target.value * 1);
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