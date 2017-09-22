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
        name: 'upfront',
        mod: 'page'
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

    App.Views.CoreUpfrontView.CoreUpfrontActionsView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'actions',
        events: {
            'click .start-order': 'start_order',
            'click .just-browsing': 'just_browsing'
        },
        start_order: function() {
            App.Data.mainModel.set('upfront_active', false);
        },
        just_browsing: function() {
            App.Data.mainModel.set('upfront_active', false);
        }
    });

    return new (require('factory'))(function() {
        App.Views.UpfrontView = {};
        App.Views.UpfrontView.UpfrontPageView = App.Views.CoreUpfrontView.CoreUpfrontPageView;
        App.Views.UpfrontView.UpfrontOrderTypeView = App.Views.CoreUpfrontView.CoreUpfrontOrderTypeView;
        App.Views.UpfrontView.UpfrontPickupView = App.Views.CoreUpfrontView.CoreUpfrontPickupView;
        App.Views.UpfrontView.UpfrontActionsView = App.Views.CoreUpfrontView.CoreUpfrontActionsView;
    });
});
