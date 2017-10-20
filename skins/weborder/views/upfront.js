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

    var UpfrontPageView = App.Views.UpfrontView.UpfrontPageView.extend({
        name: 'upfront',
        mod: 'page',
        events: {
            'click .start-order': 'start_order',
            'click .just-browsing': 'just_browsing'
        },
        start_order: function() {
            App.Data.mainModel.set('upfront_active', false);
            App.Data.mainModel.set('orderStarted', true);
        },
        just_browsing: function() {
            App.Data.mainModel.set('upfront_active', false);
        } //,
    });

    var UpfrontUpdateView = App.Views.UpfrontView.UpfrontPageView.extend({
        name: 'upfront',
        mod: 'update',
        events: {
            'click .upfront-update': 'upfront_update'
        },
        upfront_update: function() {
            App.Data.mainModel.set('upfront_update', 2);
        }
    });

    return new (require('factory'))(upfront_view.initViews.bind(upfront_view), function() {
        App.Views.UpfrontView.UpfrontPageView = UpfrontPageView;
        App.Views.UpfrontView.UpfrontUpdateView = UpfrontUpdateView;
    });
});
