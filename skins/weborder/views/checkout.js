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

define(["checkout_view"], function(checkout_view) {
    'use strict';

    var CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView.extend({
        controlAddress: function(model, value) {
            var arrAdd= this.$('.arrival_address');
            App.Views.CoreCheckoutView.CoreCheckoutMainView.prototype.controlAddress.apply(this, arguments);
            if (value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_SHIPPING' ) {
                arrAdd.hide();
            } else {
                arrAdd.show();
            }
        }
    });

    var CheckoutPageView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'page',
        bindings: {
            '.payment-methods-container': 'classes: {hide: not(hasGrandTotal(total_grandTotal))}',
            '.order-notes': 'toggle: _system_settings_order_notes_allow',
            '.notes': 'value: checkout_notes, events: ["input"]',
            '.cc-box': 'classes: {hide: any(not(equal(paymentMethods_selected, "credit_card_button")), select(length($tokens), token_selected, false), not(hasGrandTotal(total_grandTotal)))}',
            '.choose-cc-box': 'classes: {hide: any(not(equal(paymentMethods_selected, "credit_card_button")), not(length($tokens)), not(hasGrandTotal(total_grandTotal)))}',
            '.gift-card-box': 'classes: {hide: any(not(equal(paymentMethods_selected, "gift_card")), select(length($giftCards), giftCard_selected, false), not(hasGrandTotal(total_grandTotal)))}',
            '.choose-gift-card-box': 'classes: {hide: any(not(equal(paymentMethods_selected, "gift_card")), not(length($giftCards)), not(hasGrandTotal(total_grandTotal)))}',
            '.stanford-card-box': 'classes: {hide: not(equal(paymentMethods_selected, "stanford"), not(hasGrandTotal(total_grandTotal)))}',
            '.stanford-plans-box': 'classes: {hide: not(equal(paymentMethods_selected, "stanford"), not(hasGrandTotal(total_grandTotal)))}',
            '.billing-address-box': 'classes: {hide: any(not(equal(paymentMethods_selected, "credit_card_button")), select(length($tokens), token_selected, false), not(hasGrandTotal(total_grandTotal)))}',
            '.give-tips-box': 'classes: {hide: any(not(hasTips), not(hasGrandTotal(total_grandTotal)))}'
        },
        bindingFilters: {
            hasGrandTotal: function(grandTotal) {
                return Boolean(Number(grandTotal));
            }
        },
        computeds: {
            hasTips: {
                deps: ['paymentMethods_selected'],
                get: function(pm) {
                    if (pm === 'credit_card_button' ||
                        pm === 'gift_card' ||
                        pm === 'stanford' ||
                        pm === 'paypal')
                    {
                        return true;
                    }

                    return false;
                }
            }
        },
        initialize: function() {
            this.tokens = new Backbone.Collection();
            this.token = new Backbone.Model({selected: false, paymentsExist: false, ignoreSelectedToken: false});
            this.giftCard = new Backbone.Model({selected: false});
            _.extend(this.bindingSources, {
                token: this.token,           // indicates any token is selected or not
                tokens: this.tokens,         // tokens
                giftCard: this.giftCard      // indicated any saved gift card is selected or not
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.options.customer, 'onLogin', this.setProfileData);
            this.listenTo(this.options.customer, 'onLogout', this.removeProfileData);
            this.setProfileData();
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var paymentInfo = this.$('.payment-info'),
                paymentMethods, tips, discount, rewards,
                chooseCreditCard, creditCard, chooseGiftCard, giftCard,
                stanfordCard, stanfordPlans, billingAddress;

            paymentMethods = App.Views.GeneratorView.create('PaymentMethods', {
                mod: 'Main',
                model: this.options.paymentMethods,
                checkout: this.collection.checkout
            });

            this.subViews.push(paymentMethods);
            paymentInfo.append(paymentMethods.el);

            if (this.options.paymentMethods.get('credit_card_button')) {
                chooseCreditCard = App.Views.GeneratorView.create('Profile', {
                    mod: 'PaymentsSelection',
                    collection: this.tokens,
                    model: this.token,
                    className: 'choose-cc-box item'
                });

                this.subViews.push(chooseCreditCard);
                paymentInfo.append(chooseCreditCard.el);
            }

            creditCard = App.Views.GeneratorView.create('Card', {
                mod: 'Main',
                model: this.options.card,
                token: this.token,
                paymentMethods: this.options.paymentMethods,
                className: 'cc-box item'
            });

            this.subViews.push(creditCard);
            paymentInfo.append(creditCard.el);

            if (this.options.paymentMethods.get('credit_card_dialog') && this.options.needShowBillingAddess) {
                billingAddress = App.Views.GeneratorView.create('Card', {
                    mod: 'BillingAddress',
                    model: this.options.card.get("billing_address"),
                    customer: this.options.customer,
                    card: this.options.card,
                    checkout: this.collection.checkout,
                    className: 'billing-address-box'
                });

                this.subViews.push(billingAddress);
                paymentInfo.append(billingAddress.el);
            }

            if (this.options.paymentMethods.get('gift_card')) {
                chooseGiftCard = App.Views.GeneratorView.create('Profile', {
                    mod: 'GiftCardsSelection',
                    collection: this.options.giftCards,
                    model: this.giftCard,
                    className: 'choose-gift-card-box item'
                });

                this.subViews.push(chooseGiftCard);
                paymentInfo.append(chooseGiftCard.el);

                giftCard = App.Views.GeneratorView.create('GiftCard', {
                    mod: 'Main',
                    model: this.options.giftcard,
                    className: 'gift-card-box'
                });

                this.subViews.push(giftCard);
                paymentInfo.append(giftCard.el);
            }

            if (this.options.paymentMethods.get('stanford')) {
                stanfordCard = App.Views.GeneratorView.create('StanfordCard', {
                    mod: 'Main',
                    model: this.options.stanfordcard,
                    myorder: this.collection,
                    className: 'stanford-card-box'
                });

                stanfordPlans = App.Views.GeneratorView.create('StanfordCard', {
                    mod: 'PaymentPlans',
                    model: this.options.stanfordcard,
                    collection: this.options.stanfordcard.get('plans'),
                    className: 'stanford-plans-box'
                });

                this.subViews.push(stanfordCard);
                this.subViews.push(stanfordPlans);
                paymentInfo.append(stanfordCard.el);
                paymentInfo.append(stanfordPlans.el);
            }

            if(this.options.acceptTips) {
                tips = App.Views.GeneratorView.create('Tips', {
                    model: this.collection.total.get('tip'),
                    mod: 'Line',
                    total: this.collection.total,
                    paymentMethods: this.options.paymentMethods
                });
                this.subViews.push(tips);
                paymentInfo.append(tips.el);
            }

            if (this.options.discountAvailable) {
                discount = App.Views.GeneratorView.create('Checkout', {
                    model: this.collection.checkout,
                    mod: 'DiscountCode',
                    myorder: this.collection,
                    className: 'item'
                });
                this.subViews.push(discount);
                paymentInfo.append(discount.el);
            }

            this.iOSSafariCaretFix();

            return this;
        },
        setProfileData: function() {
            var promises = this.options.promises(),
                customer = this.options.customer,
                paymentInfo = this.$('.payment-info'),
                rewards,
                self = this;

           if(this.options.enableRewardCard && customer.get('user_id')) {
               rewards = App.Views.GeneratorView.create('Checkout', {
                    model: this.collection.rewardsCard,
                    mod: 'RewardsCard',
                    className: 'item'
                });
               this.subViews.push(rewards);
               paymentInfo.append(rewards.el);
           }

           if (promises.length) {
               Backbone.$.when.apply(Backbone.$, promises).then(function() {
                   if (customer.payments) {
                       customer.payments.selectFirstItem();
                       self.token.set({
                           selected: customer.payments.length > 0,
                           paymentsExist: true
                       });
                       self.tokens.reset(customer.payments.models);
                       customer.payments.ignoreSelectedToken = self.token.get('ignoreSelectedToken');
                       customer.payments.listenTo(self.token, 'change:ignoreSelectedToken', function(model, value) {
                           this.ignoreSelectedToken = value;
                       });
                   }
                   if (customer.giftCards) {
                       self.giftCard.set('selected', true);
                       customer.giftCards.selectFirstItem();
                   }
               });
           }
        },
        removeProfileData: function() {
            this.$('.reward-cards-container').hide();
            this.token.set({
                paymentsExist: false,
                selected: false
            });
            this.giftCard.set('selected', false);
            this.tokens.reset();
        }
    });

    var CheckoutRewardsCardView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'rewards_card',
        bindings: {
            '.rewards-card-apply': 'classes: {hide: length(discounts)}',
            '.see-rewards': 'classes: {hide: not(length(discounts))}',
            '.rewardCard': 'value: number, events: ["input"], attr: {readonly: select(length(discounts), true, false)}, restrictInput: "0123456789", kbdSwitcher: "numeric", pattern: /^\\d*$/'
        },
        events: {
            'click .rewards-card-apply': 'applyRewardsCard',
            'click .see-rewards': 'showRewards',
            'click .cancel-input': 'resetRewards',
            'change .rewardCard': 'changRewardCardNumber',
        },
        changRewardCardNumber: function(e) {
          var rewardCard = App.Data.myorder.rewardsCard;
          rewardCard.set('number', e.target.value);
        },
        applyRewardsCard: function() {
            this.model.trigger('onApplyRewardsCard');
        },
        showRewards: function() {
            this.model.trigger('onRewardsReceived');
        },
        resetRewards: function() {
            this.model.resetData();
        }
    });

    return new (require('factory'))(checkout_view.initViews.bind(checkout_view), function() {
        App.Views.CheckoutView.CheckoutMainView = CheckoutMainView;
        App.Views.CheckoutView.CheckoutPageView = CheckoutPageView;
        App.Views.CheckoutView.CheckoutRewardsCardView = CheckoutRewardsCardView;
    });
});
