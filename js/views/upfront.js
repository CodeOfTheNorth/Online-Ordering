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

define(["checkout_view"], function(Backbone) {
    'use strict';

    App.Views.CoreUpfrontView = {};

    App.Views.CoreUpfrontView.CoreUpfrontPageView = App.Views.FactoryView.extend({
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var orderDetails = this.$('.order-details'),
                order_type, pickup, address;

            order_type = App.Views.GeneratorView.create('Upfront', {
                mod: 'OrderType',
                model: this.options.checkout,
                dining_option: this.options.checkout.get('dining_option'),
                DINING_OPTION_NAME: this.options.DINING_OPTION_NAME,
                className: 'fl-left'
            });

            pickup = App.Views.GeneratorView.create('Upfront', {
                model: this.options.checkout,
                timetable: this.options.timetable,
                mod: 'Pickup',
                className: 'fl-left'
            });

            address = App.Views.GeneratorView.create('Upfront', {
                mod: 'Address',
                model: this.options.checkout,
                className: 'clear yourAddress'
            });

            this.subViews.push(order_type, pickup, address);

            orderDetails.append(order_type.el);
            orderDetails.append(pickup.el);
            orderDetails.append(address.el);

            return this;
        }
    });

    App.Views.CoreUpfrontView.CoreUpfrontOrderTypeView =
        App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView.extend({
        name: 'upfront',
        mod: 'order_type'
    });

    App.Views.CoreUpfrontView.CoreUpfrontPickupView =
        App.Views.CoreCheckoutView.CoreCheckoutPickupView.extend({
        name: 'upfront',
        mod: 'pickup'
    });

    App.Views.CoreUpfrontView.CoreUpfrontAddressView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'address',
        events: {
            'click #getAddress': 'getAddress'
        },
        getAddress: function(e) {
            e.preventDefault();
            // TODO: get location/address and put it inside input field
            // also pointer should be changed to 'cursor' for this field
        }
    });

    return new (require('factory'))(function() {
        App.Views.UpfrontView = {};
        App.Views.UpfrontView.UpfrontPageView = App.Views.CoreUpfrontView.CoreUpfrontPageView;
        App.Views.UpfrontView.UpfrontOrderTypeView = App.Views.CoreUpfrontView.CoreUpfrontOrderTypeView;
        App.Views.UpfrontView.UpfrontPickupView = App.Views.CoreUpfrontView.CoreUpfrontPickupView;
        App.Views.UpfrontView.UpfrontAddressView = App.Views.CoreUpfrontView.CoreUpfrontAddressView;
    });
});
