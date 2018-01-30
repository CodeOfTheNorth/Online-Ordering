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

    var UpfrontMainView = App.Views.CoreUpfrontView.CoreUpfrontMainView.extend({
        controlAddress: function(model, value) {
            var arrAdd= this.$('.arrival_address');
            App.Views.CoreUpfrontView.CoreUpfrontMainView.prototype.controlAddress.apply(this, arguments);
            if (value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_SHIPPING' ) {
                arrAdd.hide();
            } else {
                arrAdd.show();
            }
        }
    });


    var UpfrontPageView = App.Views.UpfrontView.UpfrontPageView.extend({
        name: 'upfront',
        mod: 'page',
        events: {
            'click .start-order': 'start_order',
            'click .just-browsing': 'just_browsing'
        },
        start_order: function() {
            var check = App.Data.customer.get('access_token') ?
                {status: 'OK'} :
                this.collection.check_order({customer: true, customerData: this.options.customer});
            if (check.status == 'OK') {
                App.Data.customer.set(this.options.customer.toJSON());
                App.Data.mainModel.set('upfront_active', 0);
                App.Data.mainModel.set('orderStarted', true);
            }
        },
        just_browsing: function() {
            App.Data.mainModel.set('upfront_active', 0);
        }
    });

    var UpfrontUpdateView = App.Views.UpfrontView.UpfrontPageView.extend({
        name: 'upfront',
        mod: 'update',
        events: {
            'click .upfront-update': 'upfront_update'
        },
        upfront_update: function() {
            var check = this.collection.check_order({customer: true, customerData: this.options.customer});
            if (check.status == 'OK') {
                App.Data.customer.set(this.options.customer.toJSON());
                App.Data.mainModel.set('upfront_update', 2);
            }
        }
    });

    var UpfrontAddressView = App.Views.CoreUpfrontView.CoreUpfrontAddressView.extend({
        name: 'upfront',
        mod: 'address',
        render: function() {
            App.Views.CoreUpfrontView.CoreUpfrontAddressView.prototype.render.apply(this, arguments);

            var addressSelection = App.Views.GeneratorView.create('Upfront', {
                mod: 'AddressSelection',
                checkout: this.options.checkout,
                customer: this.options.customer,
                address_index: this.options.address_index
            });
            this.subViews.push(addressSelection);
            this.$('.address-selection').html(addressSelection.el);

            return this;
        }
    });

    return new (require('factory'))(upfront_view.initViews.bind(upfront_view), function() {
        App.Views.UpfrontView.UpfrontMainView = UpfrontMainView;
        App.Views.UpfrontView.UpfrontPageView = UpfrontPageView;
        App.Views.UpfrontView.UpfrontUpdateView = UpfrontUpdateView;
        App.Views.UpfrontView.UpfrontAddressView = UpfrontAddressView;
    });
});
