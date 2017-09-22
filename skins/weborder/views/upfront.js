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

define(["upfront_view"], function(upfront_view) {
    'use strict';

/*
 * Upfront is extension of 'checkout', on the base of WOMA-7,
 * to be used for another algorithm (sequence of actions)
 */

    var UpfrontPageView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'page',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var orderDetails = this.$('.order-details'),
                paymentInfo = this.$('.payment-info'),
                order_type, pickup, actions;

            order_type = App.Views.GeneratorView.create('Upfront', {
                mod: 'OrderType',
                model: this.options.model.checkout,
                DINING_OPTION_NAME: this.options.DINING_OPTION_NAME,
                className: 'fl-left'
            });

            pickup = App.Views.GeneratorView.create('Upfront', {
                model: this.options.model.checkout,
                timetable: this.options.timetable,
                mod: 'Pickup',
                className: 'fl-left'
            });

            actions = App.Views.GeneratorView.create('Upfront', {
                mod: 'Actions',
                model: this.options.model.checkout,
                className: 'clear button-block'
            });

            this.subViews.push(order_type, pickup, actions);

            orderDetails.prepend(actions.el);
            orderDetails.prepend(pickup.el);
            orderDetails.prepend(order_type.el);

            return this;
        }
    });

    return new (require('factory'))(upfront_view.initViews.bind(upfront_view), function() {
        App.Views.UpfrontView.UpfrontPageView = UpfrontPageView;
    });
});
