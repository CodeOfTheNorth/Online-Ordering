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

define(["backbone", "checkout_view", "stanfordcard_view", "profile_view"], function(Backbone) {
    'use strict';

    App.Views.CoreConfirmView = {};

    App.Views.CoreConfirmView.CoreConfirmPayCardView = App.Views.FactoryView.extend({
        name: 'confirm',
        mod: 'card_order',
        initialize: function() {
            this.listenTo(this.collection, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(this.collection, "paymentFailed", function(message) {
                this.collection.trigger('hideSpinner');
            }, this);

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);

            // show payments
            this.options.payments && this.options.payments.length && this.showPayments();

            // show gift cards
            this.options.giftCards && this.options.giftCards.length && this.showGiftCards();
        },
        bindings: {
            '#credit-card': 'toggle: not(ui_showPayments), classes: {no_top_margin: cardBillingAddress}',
            '#billing-address': 'toggle: not(ui_showPayments)',
            '.payments': 'toggle: ui_showPayments',
            '.payments-btn': 'text: select(ui_showPayments, _lp_PROFILE_ADD_CREDIT_CARD, _lp_PAYMENTS), classes: {hidden: not(ui_showPaymentsBtn)}',
            '.gift-cards-btn': 'text: select(ui_showPayments, _lp_PROFILE_ADD_ANOTHER_CARD, _lp_GIFT_CARDS), classes: {hidden: not(ui_showGiftCardsBtn)}'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({
                    showPayments: false,
                    showPaymentsBtn: false,
                    showGiftCardsBtn: false
                });
            }
        },
        computeds: {
            cardBillingAddress: {
                deps: ['card_billing_address'],
                get: function(card_billing_address) {
                    return card_billing_address || null;
                }
            }
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.afterRender();
            return this;
        },
        afterRender: function() {
            var payments = this.options.payments,
                giftCards = this.options.giftCards;

            this.subViews.push(App.Views.GeneratorView.create(this.options.submode == 'Gift' ? 'GiftCard' : 'Card', {
                el: this.$('#credit-card'),
                mod: 'Main',
                model: this.options.card
            }));

            if (this.options.submode == 'Credit' && PaymentProcessor.isBillingAddressCard()) {
                this.subViews.push(App.Views.GeneratorView.create('Card', {
                    el: this.$('#billing-address'),
                    mod: 'BillingAddress',
                    model: this.options.card,
                    customer: this.options.customer,
                    address: this.options.card.get("billing_address")
                }));
                this.$(".left-panel .scroll-area").contentarrow();
            }

            if (payments) {
                this.subViews.push(App.Views.GeneratorView.create('Profile', {
                    el: this.$('.payments'),
                    mod: 'PaymentsSelection',
                    collection: payments
                }));
                this.$('.payments-control').show();
                payments.selectFirstItem();
            }

            if (giftCards) {
                this.subViews.push(App.Views.GeneratorView.create('Profile', {
                    el: this.$('.payments'),
                    mod: 'GiftCardsSelection',
                    collection: giftCards
                }));
                this.$('.payments-control').show();
                giftCards.selectFirstItem();
            }

            this.addCart();
        },
        events: {
            'click .btn-submit': 'submit_payment',
            'click .payments-btn': 'addCreditCard',
            'click .gift-cards-btn': 'showGiftCards',
            'keydown .btn-submit': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.submit_payment();
                }
            }
        },
        submit_payment: function(cb) {
            var self = this,
                customer = App.Data.customer,
                doPayWithToken = customer.doPayWithToken(),
                doPayWithGiftCard = customer.doPayWithGiftCard();

            saveAllData();

            self.collection.check_order({
                card: self.options.submode == 'Credit' && !doPayWithToken,
                giftcard: self.options.submode == 'Gift' && !doPayWithGiftCard,
                order: true,
                tip: true,
                customer: true,
                checkout: true,
                card_billing_address: self.options.submode == 'Credit' && !doPayWithToken && PaymentProcessor.isBillingAddressCard()
            }, function() {
                if (self.options.submode == 'Gift' && customer.isAuthorized() && !doPayWithGiftCard) {
                    customer.linkGiftCard(self.options.card).done(function(data) {
                        if (_.isObject(data) && data.status == 'OK') {
                            customer.giftCards.ignoreSelected = false;
                            makePayment();
                        }
                    }).fail(function() {
                        App.Data.errors.alert(MSG.ERROR_CAN_NOT_LINK_CARD_TO_PROFILE, true);
                    });
                } else {
                    makePayment();
                }
            });

            function makePayment() {
                typeof cb == 'function' && cb();
                self.collection.create_order_and_pay(self.options.submode == 'Gift' ? PAYMENT_TYPE.GIFT : PAYMENT_TYPE.CREDIT);
                !self.canceled && self.collection.trigger('showSpinner');
            }
        },
        addCart: function() {
            this.subViews.push(App.Views.GeneratorView.create('MyOrder', {
                el: this.$('.order-items'),
                mod: 'List',
                collection: this.collection
            }));
            this.$('.order-items').contentarrow();

            this.subViews.push(App.Views.GeneratorView.create('Total', {
                el: this.$('.total_block'),
                mod: 'Checkout',
                model: this.collection.total,
                collection: this.collection
            }));
        },
        showPayments: function() {
            var $ui = this.getBinding('$ui'),
                value = !$ui.get('showPayments'),
                payments = this.options.payments;
            $ui.set({
                showPayments: value,
                showPaymentsBtn: Boolean(payments.length)
            });
            if (value) {
                payments.ignoreSelectedToken = false;
            } else {
                payments.ignoreSelectedToken = true;
            }
        },
        addCreditCard: function() {
            var self = this;
            if (this.options.isOnlyTokensDialog) {
                self.options.customer.trigger('onAskForRememberCard', {
                    callback: submitPayment
                });
            } else {
                this.showPayments();
            }
            function submitPayment() {
                self.submit_payment(function() {
                    self.options.payments.ignoreSelectedToken = true;
                });
            }
        },
        showGiftCards: function() {
            var $ui = this.getBinding('$ui'),
                value = !$ui.get('showPayments'),
                giftCards = this.options.giftCards;
            $ui.set({
                showPayments: value,
                showGiftCardsBtn: Boolean(giftCards.length)
            });
            if (value) {
                giftCards.ignoreSelected = false;
            } else {
                giftCards.ignoreSelected = true;
            }
        }
    });

    App.Views.CoreConfirmView.CoreConfirmStanfordCardView = App.Views.CoreConfirmView.CoreConfirmPayCardView.extend({
        name: 'confirm',
        mod: 'stanford_card',
        initialize: function() {
            this.listenTo(this.options.card, 'onStanfordCardError', this.showErrorMsg, this);
            this.listenTo(this.options.card.get('plans'), 'change:selected', this.update, this);
            App.Views.CoreConfirmView.CoreConfirmPayCardView.prototype.initialize.apply(this, arguments);
            this.update();
        },
        bindings: {
            '.submit-order': 'toggle: card_validated',
            '.submit-card': 'toggle: not(card_validated), classes: {disabled: any(not(card_number), not(card_captchaKey), not(card_captchaValue))}',
        },
        events: {
            'click .btn-submit': '',
            'click .btn-submit.submit-order': 'submit_payment',
            'click .btn-submit.submit-card': 'submit_card'
        },
        afterRender: function() {
            this.subViews.push(App.Views.GeneratorView.create('StanfordCard', {
                el: this.$('#credit-card'),
                mod: 'Main',
                model: this.options.card,
                myorder: this.collection
            }));

            this.subViews.push(App.Views.GeneratorView.create('StanfordCard', {
                el: this.$('.stanford-plans'),
                mod: 'Plans',
                model: this.options.card,
                collection: this.options.card.get('plans'),
                total: this.collection.total
            }));

            this.addCart();
        },
        submit_payment: function() {
            var self = this;
            saveAllData();

            self.collection.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true
            }, function() {
                self.collection.create_order_and_pay(PAYMENT_TYPE.STANFORD);
                !self.canceled && self.collection.trigger('showSpinner');
            });
        },
        submit_card: function() {
            this.collection.trigger('showSpinner');
            this.options.card.getPlans().then(this.collection.trigger.bind(this.collection, 'hideSpinner'));
        },
        update: function() {
            if (this.options.card.getSelectedPlan())
                this.$(".submit-order").removeClass("disabled");
            else
                this.$(".submit-order").addClass("disabled");
        },
        showErrorMsg: function(msg) {
            App.Data.errors.alert(msg);
        }
    });

    return new (require('factory'))(function() {
        App.Views.ConfirmView = {};
        App.Views.ConfirmView.ConfirmPayCardView = App.Views.CoreConfirmView.CoreConfirmPayCardView;
        App.Views.ConfirmView.ConfirmStanfordCardView = App.Views.CoreConfirmView.CoreConfirmStanfordCardView;
    });
});
