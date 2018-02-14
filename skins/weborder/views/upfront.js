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
        initialize: function() {
            App.Views.CoreUpfrontView.CoreUpfrontPageView.prototype.initialize.apply(this, arguments);
            this.listenTo(App.Data.customer, 'change: addresses', this.addressChanged);
        },
        bindings: {
            '.upfront-login': 'classes: {hide: logged}'
        },
        computeds: {
            logged: function() {
                return !!App.Data.customer.get('access_token');
            }
        },
        events: {
            'click .signup-link': 'signup',
            'click .login-link': 'login',
            'click .start-order': 'start_order',
            'click .just-browsing': 'just_browsing'
        },
        signup: function() {
            App.Data.mainModel.set('loginAction', 1);
        },
        login: function() {
            App.Data.mainModel.set('loginAction', 2);
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
        },
        addressChanged: function() {
            this.options.customer.set('addresses', App.Data.customer.get('addresses'));
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
        },
        events: {
            'change input[name="street_1"]': 'changeStreetName',
            'change input[name="city"]': 'changeCityName',
            'change input[name="zipcode"]': 'changeZipCode',
            'select #states': 'changeState'
        },
        changeStreetName: function(e) {
            var currentAddr = this.options.addresses.getSelectedAddress();
            currentAddr.set('street_1', e.target.value);
            this.updateAddress();
        },
        changeCityName: function(e) {
            var currentAddr = this.options.addresses.getSelectedAddress();
             currentAddr.set('city', e.target.value);
             this.updateAddress();
        },
        changeZipCode: function(e) {
             var currentAddr = this.options.addresses.getSelectedAddress();
             currentAddr.set('zipcode', e.target.value);
             this.updateAddress();
        },
        changeState: function(e) {
            var currentAddr = this.options.addresses.getSelectedAddress();
             currentAddr.set('state', e.target.value);
             this.updateAddress();
        },
        updateAddress: function() {
            if(this.options.customer._check_delivery_fields().length) return;
            this.checkNonEmptyFields();
            if(!/checkout/.test(window.location.hash) && App.Data.mainModel.get('upfront_active') !== 0) this.options.customer.get_shipping_services();
        },
        checkNonEmptyFields: function() {
            var dining_option = this.options.checkout.get('dining_option');
            if (dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING' || dining_option === 'DINING_OPTION_CATERING') {
                if(this.options.customer._check_delivery_fields().length) return;
            }
            if(this.options.customer.check().status === 'OK') {
                $('.start-order').removeClass('disabled');
            }
        }
    });

    return new (require('factory'))(upfront_view.initViews.bind(upfront_view), function() {
        App.Views.UpfrontView.UpfrontMainView = UpfrontMainView;
        App.Views.UpfrontView.UpfrontPageView = UpfrontPageView;
        App.Views.UpfrontView.UpfrontUpdateView = UpfrontUpdateView;
        App.Views.UpfrontView.UpfrontAddressView = UpfrontAddressView;
    });
});