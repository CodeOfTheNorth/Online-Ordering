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

    App.Views.CoreUpfrontView.CoreUpfrontMainView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'main',
        bindings: {
            '.phone': 'restrictInput: "0123456789+", kbdSwitcher: "tel", pattern: /^\\+?\\d{0,15}$/',
            '.personal': 'toggle: not(isAuthorized)'
        },
        computeds: {
            isAuthorized: {
                deps: ['customer_access_token'],
                get: function() {
                    return this.getBinding('$customer').isAuthorized();
                }
            }
        },
        initialize: function() {
            var self = this;
            this.listenTo(this.model, 'change:dining_option', this.controlAddress, this);
            this.listenTo(this.model, 'change:dining_option', this.controlDeliveryOther, this);
            this.listenTo(this.options.customer, 'change:first_name change:last_name change:email change:phone', this.updateData, this);
            this.customer = this.options.customer;
            this.card = App.Data.card;
            this.address_index = -1;
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);

            this.model.get('dining_option') === 'DINING_OPTION_DELIVERY' &&
                 this.controlAddress(null, 'DINING_OPTION_DELIVERY');

            this.model.get('dining_option') === 'DINING_OPTION_SHIPPING' &&
                 this.controlAddress(null, 'DINING_OPTION_SHIPPING');

            this.model.get('dining_option') === 'DINING_OPTION_CATERING' &&
                 this.controlAddress(null, 'DINING_OPTION_CATERING');

            this.model.get('dining_option') === 'DINING_OPTION_OTHER' &&
                 this.controlDeliveryOther(null, 'DINING_OPTION_OTHER');

            this.listenTo(this.options.customer.get('rewardCards'), "add remove reset", function() {
                self.options.customer.trigger('change:rewardCards'); //it's to update binding value customer_rewardCards
            });

            this.listenTo(this.options.customer, 'onUserAddressCreated onUserAddressUpdate', function() {
                this.controlAddress(null, this.model.get('dining_option'));
            }, this);
        },
        render: function() {
            var settings = App.Data.settings.get('settings_system'),
                model = {};

            model.firstName = this.customer.escape('first_name');
            model.lastName = this.customer.escape('last_name');
            model.email = this.customer.escape('email');
            model.phone = this.customer.escape('phone');
            model.isFirefox = /firefox/i.test(navigator.userAgent);
            model.business_name = settings.business_name;
            model.address = settings.address;
            model.isMobile = typeof cssua.ua.mobile != 'undefined';

            this.$el.html(this.template(model));

            this.$('.firstName, .lastName').numberMask({pattern: /^.*$/ }).on("keypressNumber", function(event) {
                try {
                    var start = event.target.selectionStart,
                        end = event.target.selectionEnd,
                        direction = event.target.selectionDirection;
                } catch(e) {
                    console.log('There is not selection API');
                }
                var new_value = this.value.replace(/(^[a-z])|\s([a-z])/g, function(m, g1, g2){
                    return g1 ? g1.toUpperCase() : ' ' + g2.toUpperCase();
                });
                this.value = new_value;
                try {
                    event.target.setSelectionRange(start, end, direction);
                } catch(e) {}
            });

            return this;
        },
        events: {
            'blur .firstName': 'changeFirstName',
            'change .firstName': 'changeFirstName',
            'blur .lastName': 'changeLastName',
            'change .lastName': 'changeLastName',
            'blur .email': 'changeEmail',
            'change .email': 'changeEmail',
            'blur .phone': 'changePhone',
            'change .phone': 'changePhone'
        },
        changeFirstName: function(e) {
            this.customer.set('first_name', e.target.value);
        },
        changeLastName: function(e) {
            this.customer.set('last_name', e.target.value);
        },
        changeEmail: function(e) {
            this.customer.set('email', e.target.value.trim());
        },
        changePhone: function(e) {
            this.customer.set('phone', e.target.value);
        },
        controlAddress: function(model, value) {
            var address = this.subViews.shift();

            // remove address if it exists
            address && address.remove();

            if (value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_SHIPPING' || value === 'DINING_OPTION_CATERING') {
                address = new App.Views.UpfrontView.UpfrontAddressView({
                    customer: this.customer,
                    checkout: this.model,
                    address_index: this.address_index // -1 means that default profile address should be selected
                });
                this.subViews.push(address);
                this.$('.delivery_address').append(address.el);
                delete this.address_index;
            }
        },
        controlDeliveryOther: function(model, value) {
            if(value === 'DINING_OPTION_OTHER') {
                if (!this.otherView) {

                    this.otherView = new App.Views.CoreUpfrontView.CoreUpfrontOtherView({model: this.model, collection: this.model.get('other_dining_options')});
                    this.$('.delivery_other').append(this.otherView.el);
                }
                this.$('.delivery_other').show();
            } else {
                this.$('.delivery_other').hide();
            }
        },
        updateData: function() {
            var customer = this.customer;
            this.$('.firstName').val(customer.get('first_name'));
            this.$('.lastName').val(customer.get('last_name'));
            this.$('.email').val(customer.get('email'));
            this.$('.phone').val(customer.get('phone'));
        }
    });

    App.Views.CoreUpfrontView.CoreUpfrontPageView = App.Views.FactoryView.extend({
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var orderDetails = this.$('.order-details'),
                order_type, pickup, //address,
                main;

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

            main = App.Views.GeneratorView.create('Upfront', {
                model: this.collection.checkout,
                customer: this.options.customer,
                mod: 'Main',
                className: 'clear overflow-hidden'
            });

            this.subViews.push(order_type, pickup, main);

            orderDetails.prepend(main.el);
            orderDetails.prepend(pickup.el);
            orderDetails.prepend(order_type.el);

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

    App.Views.CoreUpfrontView.CoreUpfrontAddressView = App.Views.DeliveryAddressesView.extend({
        name: 'upfront',
        mod: 'address'
    });

    App.Views.CoreUpfrontView.CoreUpfrontAddressSelectionView = App.Views.DeliveryAddressesSelectionView.extend({
        name: 'upfront',
        mod: 'address_selection'
    });

    App.Views.CoreUpfrontView.CoreUpfrontOtherItemView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'other_item',
        bindings: {
            'input': 'valueTrim: value, events: ["blur", "change"]',
            'select': 'value: value, options: choices',
            '[data-isrequired]': 'classes: {required: required}'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var choices = this.model.get('choices');
            // select the first option by default
            Array.isArray(choices) && choices[0] && this.model.set('value', choices[0]);
        }
    });

    App.Views.CoreUpfrontView.CoreUpfrontOtherView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'other',
        className: 'checkout_other_view',
        bindings: {
            '.list': 'collection: $collection'
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        itemView: App.Views.CoreUpfrontView.CoreUpfrontOtherItemView
    });

    return new (require('factory'))(function() {
        App.Views.UpfrontView = {};
        App.Views.UpfrontView.UpfrontPageView = App.Views.CoreUpfrontView.CoreUpfrontPageView;
        App.Views.UpfrontView.UpfrontMainView = App.Views.CoreUpfrontView.CoreUpfrontMainView;
        App.Views.UpfrontView.UpfrontOrderTypeView = App.Views.CoreUpfrontView.CoreUpfrontOrderTypeView;
        App.Views.UpfrontView.UpfrontPickupView = App.Views.CoreUpfrontView.CoreUpfrontPickupView;
        App.Views.UpfrontView.UpfrontAddressView = App.Views.CoreUpfrontView.CoreUpfrontAddressView;
        App.Views.UpfrontView.UpfrontAddressSelectionView = App.Views.CoreUpfrontView.CoreUpfrontAddressSelectionView;
        App.Views.CoreUpfrontView.UpfrontOtherView = App.Views.CoreUpfrontView.CoreUpfrontOtherView;
        App.Views.CoreUpfrontView.UpfrontOtherItemView = App.Views.CoreUpfrontView.CoreUpfrontOtherItemView;
    });
});
