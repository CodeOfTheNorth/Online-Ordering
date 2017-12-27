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

define(["backbone"], function(Backbone) {
    'use strict';

    App.Models.MainModel=Backbone.Model.extend({
        defaults: {
            header: {},
            content: {},
            cart: {},
            profile: {},
            img: App.Data.settings.get("img_path"),
            isShowPromoMessage: false,
            needShowStoreChoice: false,
            isBlurContent: false,
            backAction: window.history.back.bind(window.history),
            /*
             * Indicates if initial upfront screen is active
             */
            upfront_active: false,
            /*
             * Indicates the state of upfront update dialog:
             * 0 - dialog closed
             * 1 - dialog opened
             * 2 - dialog closing by Update button
             */
            upfront_update: 0,
            /*
             * Indicates if user select 'start ordering' (true) or 'just browsing' (false)
             */
            orderStarted: false,
            /*
             * Indicates that categories have been reloaded, to refresh some dependent views
             */
            categoriesReloading: false,
            /*
             * Contains a copy of myorder while editing it, to be able to cancel without data changing
             */
            orderClone: null,
            /*
             * Contains a copy of customer while editing, to be able to cance without data changing
             */
            customerClone: null,
            /*
             *
             */
            DINING_OPTION_NAME: null
        }
    });
});