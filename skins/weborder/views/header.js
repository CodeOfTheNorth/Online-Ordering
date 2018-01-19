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

define(["backbone", "factory"], function() {
    'use strict';

    function onClick(eventName) {
        return function() {
            this.model.trigger(eventName);
        };
    }

    var HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(App.Data.myorder.checkout, 'change', this.applyBindings);
            App.Data.mainModel.set('upfront_active', true);
        },
        bindings: {
            '.menu': 'classes: {active: strictEqual(tab_index, 0)}',
            '.about': 'classes: {active: strictEqual(tab_index, 1)}',
            '.map': 'classes: {active: strictEqual(tab_index, 2)}',
            '.title': 'text: business_name',
            '.order-type-name': 'text: orderType',
            '.pickup-label': 'text: pickupLabel',
            '.delivery-time': 'text: deliveryTime',
            '.delivery-address-block': 'classes: {hide: deliveryAddressHide}',
            '.promotions-link': 'toggle: promotions_available',
            '.open-now': 'text: select(openNow, _lp_STORE_INFO_OPEN_NOW, _lp_STORE_INFO_CLOSED_NOW)'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            loadSpinner(this.$('img.img'));
        },
        events: {
            'click .menu': onClick('onMenu'),
            'click .about': onClick('onAbout'),
            'click .map': onClick('onMap'),
            'click .promotions-link': onClick('onPromotions'),
            'click .order-type-name, .delivery-time': 'setOrder'
        },
        computeds: {
            openNow: function() {
                return App.Data.timetables.openNow();
            },
            orderType: function() {
                var order_type = App.Data.myorder.checkout.get('dining_option');
                if (order_type === '') {
                    return '';
                }
                var _lp = this.getBinding('$_lp').toJSON();
                return _lp.DINING_OPTION_NAME[order_type];
            },
            pickupLabel: function() {
                var option = App.Data.myorder.checkout.get('dining_option');
                    if (option === 'DINING_OPTION_DELIVERY' || option === 'DINING_OPTION_OTHER') {
                        return _loc.CONFIRM_DELIVERY_TIME;
                    }
                    return _loc.CONFIRM_ARRIVAL_TIME;
            },
            deliveryTime: function() {
                var date = new Date(App.Data.myorder.checkout.get('pickupTS'));
                if (!date || !App.Data.myorder.checkout.get('pickupTS')) {
                    App.Data.myorder.checkout.set('pickupTS', App.Data.timetables.get_server_time(new Date()).valueOf());
                    date = new Date(App.Data.myorder.checkout.get('pickupTS'));
                }
                var day = App.Data.myorder.checkout.selectedDate();
                var t = new TimeFrm(date.getHours(), date.getMinutes());
                return day + ', ' + t.toString();
            },
            deliveryAddressHide: function() {
                return App.Data.myorder.checkout.get('dining_option') != 'DINING_OPTION_DELIVERY';
            }
        },
        setOrder: function(e) {
            e.preventDefault();
            App.Data.mainModel.set(
                App.Data.mainModel.get('orderStarted') ?
                'upfront_update' :
                'upfront_active',
                1);
        }
    });

    return new (require('factory'))(function() {
        App.Views.HeaderView = {};
        App.Views.HeaderView.HeaderMainView = HeaderMainView;
    });
});
