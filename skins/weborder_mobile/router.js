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

define(["main_router"], function(main_router) {
    'use strict';

    var headerModes = {};

    /**
    * Default router data.
    */
    function defaultRouterData() {
        headerModes.Main = {mod: 'Main', className: 'main'};
        headerModes.Modifiers = {mod: 'Modifiers', className: 'modifiers'};
        headerModes.Cart = {mod: 'Cart'};
    }

    var Router = App.Routers.RevelOrderingRouter.extend({
        routes: {
            "": "index",
            "index": "index",
            "search/:search": "search",
            "products/:ids": "products",
            "modifiers/:id_category(/:id_product)": "modifiers",
            "cart": "cart",
            "checkout" : "checkout",
            "confirm": "confirm",
            "payments": "payments",
            "card" : "card",
            "giftcard" : "gift_card",
            // "stanfordcard": "stanford_card",
            // "stanford_is_student": "stanford_is_student",
            // "stanford_student_verification": "stanford_student_verification",
            "done": "done",
            // "location": "location",
            "location": "location",
            "about": "about",
            // "gallery": "gallery",
            // "maintenance": "maintenance",
            "pay": "pay",
            // "profile(/:step)": "profile",
            // "loyalty": "loyalty",
            // "rewards_card_submit": "rewards_card_submit",
            // "rewards": "rewards",
            "*other": "index"
        },
        hashForGoogleMaps: ['location', 'map', 'checkout'],//for #index we start preload api after main screen reached
        initialize: function() {
            App.Data.get_parameters = parse_get_params(); // get GET-parameters from address line
            var self = this;

            // set locked routes if online orders are disabled
            if(!App.Settings.online_orders) {
                this.lockedRoutes = [];
            }

            // load main, header, footer necessary files
            this.prepare('main', function() {
                App.Views.Generator.enableCache = true;
                // set header, footer, main models
                App.Data.header = new App.Models.HeaderModel({
                    cart: this.navigate.bind(this, 'cart')
                });
                App.Data.footer = new App.Models.FooterModel();
                var mainModel = App.Data.mainModel = new App.Models.MainModel();
                var ests = App.Data.establishments;

                // init RevelAPI
                this.initRevelAPI();

                // only establishment with reward cards option enabled can show RevelAPI buttons
                App.Settings.RevelAPI = App.Settings.RevelAPI && App.Settings.enable_reward_cards_collecting;

                // init payments handlers
                this.paymentsHandlers();

                this.listenTo(App.Data.myorder, 'add remove', function() {
                    App.Data.header.set('cartItemsQuantity', App.Data.myorder.get_only_product_quantity());
                });

                new App.Views.MainView.MainMainView({
                    model: mainModel,
                    el: 'body'
                });
//common
                this.listenTo(this, 'needLoadEstablishments', this.getEstablishments, this); // get a stores list
//common
                this.listenTo(ests, 'resetEstablishmentData', this.resetEstablishmentData, this);
                this.listenTo(ests, 'resetEstablishmentData', mainModel.trigger.bind(mainModel, 'showSpinnerAndHideContent'), this);
//common
                this.listenTo(ests, 'clickButtonBack', mainModel.set.bind(mainModel, 'isBlurContent', false), this);

                var limitHashes = ["card", "giftcard", "stanfordcard", "confirm", "pay"];
                if(App.Data.stanfordCard && App.Data.stanfordCard.get('needToAskStudentStatus')) {
                    Array.prototype.push.apply(this.lockedRoutes, limitHashes);
                }

                App.Data.stanfordCard && this.listenTo(App.Data.stanfordCard, 'change:needToAskStudentStatus', function(stanfordCard, needToAskStudentStatus) {
                    if(needToAskStudentStatus) {
                        Array.prototype.push.apply(self.lockedRoutes, limitHashes);
                    } else {
                        var args = _.clone(limitHashes);
                        args.unshift(self.lockedRoutes);
                        self.lockedRoutes = _.without.apply(_, args);
                    }
                });

                this.navigationControl();

                // run history tracking
                this.triggerInitializedEvent();
            });

            var checkout = App.Data.myorder.checkout;
            checkout.trigger("change:dining_option", checkout, checkout.get("dining_option"));

            App.Routers.RevelOrderingRouter.prototype.initialize.apply(this, arguments);
        },
        paymentsHandlers: function() {
            var mainModel = App.Data.mainModel,
                myorder = App.Data.myorder,
                paymentCanceled = false,
                paymentFailed = false;

            this.listenTo(myorder, 'cancelPayment', function() {
                paymentCanceled = true;
            });

            this.listenTo(myorder, "paymentFailed", function(message) {
                paymentFailed = true;
                message && App.Data.errors.alert(message); // user notification
            }, this);

            /** [Credit Card] **/
            App.Data.payments = new App.Models.Payments(App.Data.settings.get_payment_process());

            // invokes when user chooses the 'Credit Card' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithCreditCard', function() {
                if(App.Settings.RevelAPI) {
                    App.Data.RevelAPI.checkCreditCard();
                } else {
                    showDefaultCardView.call(this);
                }
            }, this);

            this.listenTo(myorder, 'payWithCreditCard', function() {
                var paymentProcessor = App.Data.settings.get_payment_process();
                myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                    card: true
                }, sendRequest.bind(window, PAYMENT_TYPE.CREDIT));
            });

            /* Gift Card */
            App.Data.giftcard = new App.Models.GiftCard;

            // invokes when user chooses the 'Gift Card' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithGiftCard', function() {
                this.navigate('giftcard', true);
            }, this);

            this.listenTo(App.Data.giftcard, 'pay', function() {
                myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                    giftcard: true
                }, sendRequest.bind(window, PAYMENT_TYPE.GIFT));
            }, this);

            /* Cash Card */
            // invokes when user chooses the 'Cash' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithCash', function() {
                myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                }, sendRequest.bind(window, PAYMENT_TYPE.NO_PAYMENT));
            }, this);

            /* PayPal */
            // invokes when user chooses the 'PayPal' payment processor on the #payments screen
            this.listenTo(App.Data.payments, 'payWithPayPal', function() {
                App.Data.myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                }, sendRequest.bind(window, PAYMENT_TYPE.PAYPAL));
            }, this);

            /* Stanford Card */
            if(_.isObject(App.Settings.payment_processor) && App.Settings.payment_processor.stanford) {
                App.Data.stanfordCard = new App.Models.StanfordCard();

                // invokes when user chooses the 'Stanford Card' payment processor on the #payments screen
                this.listenTo(App.Data.payments, 'payWithPayPal', function() {
                    this.navigate('stanfordcard', true);
                }, this);

                this.listenTo(App.Data.stanfordCard, 'pay', function() {
                    myorder.check_order({
                        order: true,
                        tip: true,
                        customer: true,
                        checkout: true,
                    }, sendRequest.bind(window, PAYMENT_TYPE.STANFORD));
                });
            }

            function sendRequest(paymentType) {
                saveAllData();
                myorder.create_order_and_pay(paymentType);
                !paymentCanceled && mainModel.trigger('loadStarted');
                paymentFailed && mainModel.trigger('loadCompleted');
                paymentCanceled = false;
                paymentFailed = false;
            }
        },
        navigationControl: function() {
            this.listenTo(App.Data.header, 'change:tab', function() {
                switch(App.Data.header.get('tab')) {
                    case 0:
                        this.navigate('index', true);
                        break;

                    case 1:
                        this.navigate('about', true);
                        break;

                    case 2:
                        this.navigate('location', true);
                        break;
                }
            }, this);

            // onApplyRewardsCard event occurs when Rewards Card's 'Apply' button is clicked on #checkout page
            this.listenTo(App.Data.myorder.rewardsCard, 'onApplyRewardsCard', this.navigate.bind(this, 'rewards_card_submit', true));

            // onGetRewards event occurs when Rewards Card's 'Submit' button is clicked on 'Rewards Card Info' popup
            this.listenTo(App.Data.myorder.rewardsCard, 'onGetRewards', function() {
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.rewardsCard.getRewards();
            });

            // onRedemptionApplied event occurs when 'Apply Reward' btn is clicked
            this.listenTo(App.Data.myorder.rewardsCard, 'onRedemptionApplied', function() {
                var self = this;
                App.Data.mainModel.trigger('loadStarted');
                App.Data.myorder.get_cart_totals().always(function() {
                    App.Data.mainModel.trigger('loadCompleted');
                    self.navigate('checkout', true);
                });
            }, this);

            // onRewardsErrors event occurs when /weborders/reward_cards/ request fails
            this.listenTo(App.Data.myorder.rewardsCard, 'onRewardsErrors', function(errorMsg) {
                App.Data.errors.alert(errorMsg);
                App.Data.mainModel.trigger('loadCompleted');
            });

            // onRewardsReceived event occurs when Rewards Card data is received from server
            this.listenTo(App.Data.myorder.rewardsCard, 'onRewardsReceived', function() {
                var rewardsCard = App.Data.myorder.rewardsCard;

                if(rewardsCard.get('points').isDefault() && rewardsCard.get('visits').isDefault() && rewardsCard.get('purchases').isDefault()) {
                    App.Data.errors.alert(MSG.NO_REWARDS_AVAILABLE);
                } else {
                    this.navigate('rewards', true);
                }

                App.Data.mainModel.trigger('loadCompleted');
            }, this);
        },
        /**
         * Navigate on #done when payment is completed.
         */
        onPayHandler: function(capturePhase) {
            this.navigate('done',  {
                trigger: true,
                replace: capturePhase
            });
        },
        /**
        * Get a stores list.
        */
        getEstablishments: function() {
            this.getEstablishmentsCallback = function() {
                var si = App.Data.storeInfo;
                if (/^(index.*)?$/i.test(Backbone.history.fragment) && si) si.set('needShowStoreChoice', true);
            };
            App.Routers.RevelOrderingRouter.prototype.getEstablishments.apply(this, arguments);
        },
        initCategories: function() {
            if (!App.Data.categories) {
                App.Data.categories = new App.Collections.Categories();
                App.Data.parentCategories = new App.Collections.SubCategories();
                App.Data.categories.loadData = App.Data.categories.get_categories();
                App.Data.categories.loadData.then(function() {
                    App.Data.parentCategories.add(App.Data.categories.getParents());
                });
            }

            return App.Data.categories.loadData;
        },
        index: function() {
            this.prepare('index', function() {
                // load categories
                this.initCategories().then(this.change_page.bind(this));

                App.Data.header.set({
                    page_title: App.Settings.business_name || '',
                    back: App.Data.dirMode ? this.navigateDirectory.bind(this) : null,
                    back_title: App.Data.dirMode ? _loc.BACK : '',
                    tab: 0
                });

                var content = [{
                    modelName: 'Categories',
                    collection: App.Data.parentCategories,
                    mod: 'Parents',
                    cacheId: true
                }];

                App.Settings.promo_message && content.push({
                    modelName: 'PromoMessage',
                    mod: 'Main',
                    model: new Backbone.Model(),
                    className: 'fixed-bottom promo-message-container bg-color1',
                    cacheId: true
                });

                App.Data.mainModel.set({
                    header: headerModes.Main,
                    contentClass: '',
                    content: content
                });

                if(App.Data.categories.loadData.state() == 'resolved')
                    this.change_page();

                App.Data.settings.load_geoloc();
            });
        },
        search: function(search) {
            var self = this;

            this.prepare('search', function() {
                if (!App.Data.search) {
                    App.Data.search = new App.Collections.Search();
                }

                App.Data.header.set({
                    page_title: App.Settings.business_name || '',
                    back: window.history.back.bind(window.history),
                    back_title: _loc.BACK,
                    search: decodeURIComponent(search),
                    showSearch: true
                });

                App.Data.mainModel.set({
                    header: headerModes.Main
                });

                // need to show serach result list when request is complete
                this.listenToOnce(App.Data.search, 'onSearchComplete', showResults);

                // need to stop listening search events when hash changes (it fixes case when user changes hash during request )
                this.listenToOnce(this, 'route', this.stopListening.bind(this, App.Data.search, 'onSearchComplete', showResults));

                // perform search
                App.Data.search.search(decodeURIComponent(search));

                function showResults(searchModel) {
                    var category = new App.Models.Category({
                        name: _loc.SEARCH_RESULTS + ': ' + searchModel.get('pattern'),
                        products: searchModel.get('products') || (new App.Collections.Products())
                    });

                    App.Data.mainModel.set({
                        contentClass: '',
                        content: {
                            modelName: 'Categories',
                            model: category,
                            mod: 'Item',
                            tagName: 'div',
                            cacheId: true,
                            cacheIdUniq: search
                        }
                    });

                    self.change_page();
                }
            });
        },
        products: function(ids) {
            var self = this,
                _ids = JSON.parse('[' + ids + ']'),
                fetched;

            if(typeof this.products.fetched == 'undefined') {
                this.products.fetched = {};
            }

            fetched = this.products.fetched;

            this.prepare('products', function() {
                App.Data.header.set({
                    page_title: App.Settings.business_name || '',
                    back: self.navigate.bind(self, 'index', true),
                    back_title: _loc.BACK
                });

                App.Data.mainModel.set({
                    header: headerModes.Main
                });

                // load categories and products
                $.when(this.initCategories(), App.Collections.Products.get_slice_products(_ids)).then(function() {
                    var parentCategory = App.Data.parentCategories.findWhere({ids: ids}),
                        subs;

                    if(parentCategory) {
                        subs = parentCategory.get('subs');
                    } else {
                        return self.navigate('index', true);
                    }

                    !fetched[ids] && subs.each(function(category) {
                        var products = App.Data.products[category.get('id')];
                        category.get('products').reset(products ? products.toJSON() : []);
                    });

                    fetched[ids] = true;

                    App.Data.mainModel.set({
                        contentClass: '',
                        content: {
                            modelName: 'Categories',
                            model: parentCategory,
                            mod: 'Main',
                            cacheId: true,
                            cacheIdUniq: ids
                        }
                    });

                    self.change_page();
                });
            });
        },
        modifiers: function(id_category, id_product) {
            this.prepare('modifiers', function() {
                var self = this,
                    header = App.Data.header,
                    isEditMode = !id_product,
                    order = isEditMode ? App.Data.myorder.at(id_category) : new App.Models.Myorder();

                if(!order)
                    return this.navigate('index', true);

                if(isEditMode) {
                    this.listenTo(order, 'change', setHeaderToUpdate);
                    setHeaderToUpdate();
                    showProductDetails();
                } else {
                    setHeaderToAdd();
                    order.add_empty(id_product * 1, id_category * 1).then(showProductDetails);
                }

                header.set({
                    back: back,
                    back_title: _loc.BACK,
                    cart: cart
                });

                App.Data.mainModel.set({
                    header: headerModes.Modifiers
                });

                function showProductDetails() {
                    if(!isEditMode) {
                        order = order.clone();
                    }

                    App.Data.mainModel.set({
                        contentClass: '',
                        content: {
                            modelName: 'MyOrder',
                            model: order,
                            mod: 'Matrix',
                            cacheId: false
                        }
                    });

                    self.change_page();
                }

                function back() {
                    self.stopListening(order, 'change', setHeaderToUpdate);
                    window.history.back();
                }

                function cart() {
                    self.stopListening(order, 'change', setHeaderToUpdate);
                    header.set('cart', self.navigate.bind(self, 'cart', true), {silent: true});
                    self.navigate('cart', true);
                }

                function setHeaderToUpdate() {
                    header.set({
                        page_title: _loc.CUSTOMIZE,
                        link_title: _loc.UPDATE,
                        link: App.Settings.online_orders ? header.updateProduct.bind(header, order, order.clone()) : header.defaults.link
                    });
                }

                function setHeaderToAdd() {
                    header.set({
                        page_title: _loc.CUSTOMIZE,
                        link_title: _loc.ADD_TO_CART,
                        link: !App.Settings.online_orders ? header.defaults.link : function() {
                            header.addProduct(order);
                            self.listenTo(order, 'change', setHeaderToUpdate);
                        }
                    });
                }
            });
        },
        cart: function() {
            App.Data.header.set({
                page_title: _loc.HEADER_MYORDER_PT,
                back_title: _loc.MENU,
                back: this.navigate.bind(this, 'index', true),
            });

            this.prepare('cart', function() {
                App.Data.footer.set({
                    action: this.navigate.bind(this, 'checkout', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Cart,
                    contentClass: '',
                    content: [
                        {
                            modelName: 'MyOrder',
                            collection: App.Data.myorder,
                            mod: 'List',
                            className: 'myorderList'
                        },
                        {
                            modelName: 'MyOrder',
                            model: App.Data.myorder.checkout,
                            mod: 'Note',
                            className: 'myorderNote'
                        },
                        {
                            modelName: 'Footer',
                            model: App.Data.footer,
                            total: App.Data.myorder.total,
                            mod: 'Cart',
                            className: 'fixed-bottom footer bg-color10'
                        }
                    ]
                });

                this.change_page();
            });
        },
        checkout: function() {
            App.Data.header.set({
                page_title: _loc.HEADER_CHECKOUT_PT,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'cart', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart
            });

            this.prepare('checkout', function checkout1() {
                var RevelAPI = App.Data.RevelAPI;

                if(!App.Data.card)
                    App.Data.card = new App.Models.Card({RevelAPI: RevelAPI});

                if(!App.Data.customer) {
                    App.Data.customer =  new App.Models.Customer({RevelAPI: RevelAPI});
                    App.Data.customer.loadAddresses();
                }

                App.Data.footer.set({
                    btn_title: _loc.CONTINUE,
                    action: setAction(this.navigate.bind(this, 'confirm', true))
                });

                App.Data.mainModel.set({
                    contentClass: 'bg-color12',
                    content: [
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            collection: App.Data.myorder,
                            mod: 'OrderType',
                            DINING_OPTION_NAME: _loc.DINING_OPTION_NAME,
                            className: 'checkout',
                            cacheId: true
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            customer: App.Data.customer,
                            rewardsCard: App.Data.myorder.rewardsCard,
                            mod: 'Main',
                            className: 'checkout',
                            cacheId: true
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            timetable: App.Data.timetables,
                            mod: 'Pickup',
                            className: 'checkout',
                            cacheId: true
                        },
                        {
                            modelName: 'Footer',
                            mod: 'Main',
                            model: App.Data.footer,
                            className: 'fixed-bottom footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'checkout'
                        }
                    ]
                });

                this.change_page();
            });

            function setAction(cb) {
                return function () {
                    App.Data.myorder.check_order({
                        order: true,
                        customer: true,
                        checkout: true,
                        validationOnly: true
                    }, function() {
                        if(App.Data.stanfordCard && App.Data.stanfordCard.get('needToAskStudentStatus')) {
                            App.Data.router.navigate('stanford_is_student', true);
                        } else {
                            cb();
                        }
                    });
                };
            }
        },
        confirm: function() {
            var self = this,
                load = $.Deferred(),
                myorder = App.Data.myorder;

            if (myorder.length === 0) {
                load = this.loadData();
            } else {
                load.resolve();
            }

            App.Data.header.set({
                page_title: _loc.HEADER_CHECKOUT_PT,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'checkout', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart
            });

            this.prepare('confirm', function() {
                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                App.Data.footer.set({
                    btn_title: _loc.CONTINUE,
                    action: goToPayments
                });

                App.Data.mainModel.set({
                    contentClass: 'bg-color12',
                    content: [
                        {
                            modelName: 'Total',
                            model: myorder.total,
                            mod: 'Checkout',
                            collection: myorder,
                            checkout: myorder.checkout,
                            showDiscountCode: showDiscountCode,
                            cacheId: true
                        },
                        {
                            modelName: 'Tips',
                            model: myorder.total.get('tip'),
                            mod: 'Line',
                            total: myorder.total,
                            cacheIt: true
                        },
                        {
                            modelName: 'Footer',
                            mod: 'Main',
                            model: App.Data.footer,
                            className: 'fixed-bottom footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'confirm'
                        }
                    ]
                });

                this.change_page();
            }, [load]);

            function goToPayments() {
                App.Data.myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true
                }, function() {
                   self.navigate('payments', true);
                });
            }

            function showDiscountCode() {
                App.Data.errors.alert('', false, false, {
                    isConfirm: true,
                    typeIcon: '',
                    confirm: {
                        ok: _loc.MYORDER_APPLY
                    },
                    customView: new App.Views.CheckoutView.CheckoutDiscountCodeView({
                        model: myorder.checkout,
                        className: 'checkout-discount-code'
                    }),
                    callback: function(res) {
                        if(!res) {
                            return;
                        }

                        if (!/^[\d\w]{1,200}$/.test(myorder.checkout.get("discount_code")) ) {
                            return App.Data.errors.alert(MSG.ERROR_INCORRECT_DISCOUNT_CODE); // user notification
                        }

                        myorder.get_cart_totals({apply_discount: true});
                    }
                });
            }
        },
        payments: function() {
            App.Data.header.set({
                page_title: _loc.PAY,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'confirm', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart
            });

            this.prepare('payments', function() {
                App.Data.footer.set({
                    action: App.Data.payments.onPay.bind(App.Data.payments)
                });

                App.Data.mainModel.set({
                    contentClass: '',
                    content: [
                        {
                            modelName: 'Payments',
                            model: App.Data.payments,
                            checkout: App.Data.myorder.checkout,
                            mod: 'Main',
                            collection: App.Data.myorder,
                            cacheId: true
                        },
                        {
                            modelName: 'Footer',
                            mod: 'PaymentSelection',
                            model: App.Data.footer,
                            total: App.Data.myorder.total,
                            className: 'fixed-bottom footer footer-payments bg-color10',
                            cacheId: true
                        }
                    ]
                });

                this.change_page();
            });
        },
        card: function() {
            App.Data.header.set({
                page_title: _loc.HEADER_CARD_PT,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'payments', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart
            });

            this.prepare('card', function() {
                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                App.Data.footer.set({
                    btn_title: _loc.FOOTER_PROCEED,
                    action: App.Data.myorder.trigger.bind(App.Data.myorder, 'payWithCreditCard')
                });

                App.Data.mainModel.set({
                    contentClass: '',
                    content: [
                        {
                            modelName: 'Card',
                            model: App.Data.card,
                            mod: 'Main',
                            cacheId: true
                        },
                        {
                            modelName: 'Footer',
                            mod: 'Main',
                            model: App.Data.footer,
                            className: 'fixed-bottom footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'card'
                        }
                    ]
                });

                this.change_page();
            });
        },
        gift_card: function() {
            App.Data.header.set({
                page_title: _loc.HEADER_GIFT_CARD_PT,
                back_title: _loc.BACK,
                back: this.navigate.bind(this, 'payments', true)
            });

            App.Data.mainModel.set({
                header: headerModes.Cart
            });

            this.prepare('giftcard', function() {
                App.Data.footer.set({
                    btn_title: _loc.FOOTER_PROCEED,
                    action: App.Data.giftcard.trigger.bind(App.Data.giftcard, 'pay')
                });

                App.Data.mainModel.set({
                    contentClass: '',
                    content: [
                        {
                            modelName: 'GiftCard',
                            model: App.Data.giftcard,
                            mod: 'Main',
                            cacheId: true
                        },
                        {
                            modelName: 'Footer',
                            mod: 'Main',
                            model: App.Data.footer,
                            className: 'fixed-bottom footer bg-color10',
                            cacheId: true,
                            cacheIdUniq: 'giftcard'
                        }
                    ]
                });

                this.change_page();
            });
        },
        stanford_card: function() {
            this.prepare('stanfordcard', function() {

                App.Data.header.set({
                    page_title: _loc['HEADER_STANFORD_CARD_PT']
                });

                App.Data.mainModel.set({
                    header: headerModes.StanfordCard,
                    footer: _.extend(footerModes.StanfordCard, {
                        mainModel: App.Data.mainModel,
                        card: App.Data.stanfordCard,
                        myorder: App.Data.myorder
                    }),
                    content: [{
                        modelName: 'StanfordCard',
                        model: App.Data.stanfordCard,
                        mod: 'Main',
                        myorder: App.Data.myorder
                    }, {
                        modelName: 'StanfordCard',
                        model: App.Data.stanfordCard,
                        collection: App.Data.stanfordCard.get('plans'),
                        mod: 'Plans',
                        className: 'stanford-card-plans'
                    }]
                });

                this.change_page();
            });
        },
        stanford_is_student: function() {
            this.prepare('stanford_is_student', function() {

                App.Data.header.set({
                    page_title: _loc['STANFORD'],
                    back_title: _loc['HEADER_CONFIRM_BT'],
                    back: this.navigate.bind(this, 'checkout', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.StanfordIsStudent,
                    footer: _.extend(footerModes.StanfordIsStudent, {
                        mainModel: App.Data.mainModel,
                        card: App.Data.stanfordCard
                    }),
                    content: [{
                        modelName: 'StanfordCard',
                        model: App.Data.stanfordCard,
                        mod: 'StudentStatus'
                    }]
                });

                this.change_page();
            });
        },
        stanford_student_verification: function() {
            this.prepare('stanford_student_verification', function() {

                App.Data.header.set({
                    page_title: _loc['STANFORD_VERIFICATION'],
                    back_title: _loc['HEADER_CONFIRM_BT'],
                    back: this.navigate.bind(this, 'checkout', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.StanfordIsStudent,
                    footer: _.extend(footerModes.StanfordStudentVerification, {
                        mainModel: App.Data.mainModel,
                        card: App.Data.stanfordCard
                    }),
                    content: [{
                        modelName: 'StanfordCard',
                        model: App.Data.stanfordCard,
                        mod: 'Main',
                        myorder: App.Data.myorder
                    }]
                });

                this.change_page();
            });
        },
        /**
         * Handler for #done.
         * If App.Data.myorder.paymentResponse is null this handler isn't executed and run #index handler.
         */
        done: function() {
            // if App.Data.myorder.paymentResponse isn't defined navigate to #index
            if(!(App.Data.myorder.paymentResponse instanceof Object)) {
                return this.navigate('index', true);
            }

            var success = App.Data.myorder.paymentResponse.status === 'OK';

            App.Data.header.set({
                page_title: success ? _loc.DONE_THANK_YOU + '!' : '',
                back_title: ''
            });

            App.Data.mainModel.set({
                header: headerModes.Cart
            });

            this.prepare('done', function() {
                // if App.Data.customer doesn't exist (success payment -> history.back() to #confirm -> history.forward() to #done)
                // need to init it.
                if(!App.Data.customer) {
                    this.loadCustomer();
                }

                App.Data.mainModel.set({
                    contentClass: 'bg-color12 done-container',
                    content: {
                        modelName: 'Main',
                        model: App.Data.mainModel,
                        payment: new Backbone.Model({success: success}),
                        mod: "Done",
                        className: 'done text-center'
                    }
                });

                this.change_page();
            });
        },
        location: function() {
            App.Data.header.set({
                page_title: App.Settings.business_name || '',
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history),
                tab: 2
            });

            App.Data.mainModel.set({
                header: headerModes.Main
            });

            this.prepare('store_info', function() {
                App.Data.mainModel.set({
                    content: {
                        modelName: 'StoreInfo',
                        mod: 'Map',
                        className: 'map'
                    }
                });

                this.change_page();
            });
        },
        about: function() {
            var model = new Backbone.Model({
                    hours: App.Data.timetables.get('hours')
                });

            App.Data.header.set({
                page_title: App.Settings.business_name || '',
                back_title: _loc.BACK,
                back: window.history.back.bind(window.history),
                tab: 1
            });

            App.Data.mainModel.set({
                header: headerModes.Main
            });

            this.prepare('store_info', function() {
                App.Data.mainModel.set({
                    content: {
                        modelName: 'StoreInfo',
                        model: model,
                        mod: 'Main',
                        className: 'store-info'
                    }
                });

                this.change_page();
            });
        },
        gallery: function() {

            this.prepare('store_info', function() {

                if (!App.Data.AboutModel) {
                    App.Data.AboutModel = new App.Models.AboutModel();
                }

                App.Data.header.set({
                    page_title: App.Data.settings.get('settings_system').business_name + ' ' + _loc['HEADER_GALLERY_PT'],
                    back_title: _loc['HEADER_GALLERY_BT'],
                    back: this.navigate.bind(this, 'about', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Gallery,
                    footer: footerModes.Gallery,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.AboutModel,
                        mod: 'Gallery',
                        className: 'gallery'
                    }
                });

                this.change_page();
            });
        },
        maintenance : function() {
            App.Routers.RevelOrderingRouter.prototype.maintenance.apply(this, arguments);

            this.prepare('maintenance', function() {
                var back_title, back;
                if (App.Data.dirMode) {
                    back_title = _loc['HEADER_MAINTENANCE_DIR_BT'];
                    back = this.navigateDirectory.bind(this);
                } else {
                    back_title = _loc['HEADER_MAINTENANCE_BT'];
                    back = function() { window.history.back() };
                }
                var header = {
                    back: back,
                    back_title: back_title,
                    page_title: '&nbsp;'
                };

                App.Data.header.set(header);

                App.Data.mainModel.set({
                    header: !App.Data.dirMode ?
                        this.isNotFirstLaunch ?
                            headerModes.Maintenance.WithButtons :
                            headerModes.Maintenance.WithoutButtons :
                        headerModes.Maintenance.WithButtons,
                    footer: App.Data.dirMode ? footerModes.MaintenanceDirectory : footerModes.Maintenance,
                    content: {
                        modelName: 'Maintenance',
                        mod: 'Main',
                        className: 'maintenance'
                    }
                });

                this.change_page();
            });
        },
        profile: function(step) {
            App.Data.header.set({
                page_title: _loc['HEADER_PROFILE_PT'],
                back_title: _loc['HEADER_PROFILE_BT'],
                back: App.Data.RevelAPI.trigger.bind( App.Data.RevelAPI, 'onProfileCancel')
            });
            return App.Routers.RevelOrderingRouter.prototype.profile.call(this, step, headerModes.Profile, footerModes.Profile);
        },
        loyalty: function() {
            return App.Routers.RevelOrderingRouter.prototype.loyalty.call(this, headerModes.Main, footerModes.Loyalty);
        },
        rewards_card_submit: function() {
            this.prepare('rewards', function() {
                App.Data.header.set({
                    page_title: _loc['HEADER_REWARDS_CARD_PT'],
                    back_title: _loc['HEADER_REWARDS_CARD_BT'],
                    back: this.navigate.bind(this, 'checkout', true)
                });
                App.Data.mainModel.set({
                    header: headerModes.OneButton,
                    footer: footerModes.RewardsCard,
                    content: {
                        modelName: 'Rewards',
                        mod: 'Card',
                        model: App.Data.myorder.rewardsCard,
                        className: 'rewards-info'
                    }
                });

                this.change_page();
            });
        },
        rewards: function() {
            this.prepare('rewards', function() {
                var rewardsCard = App.Data.myorder.rewardsCard;

                App.Data.header.set({
                    page_title: _loc['HEADER_REWARDS_PT'],
                    back_title: _loc['HEADER_REWARDS_PT'],
                    back: this.navigate.bind(this, 'checkout', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.OneButton,
                    footer: footerModes.Rewards,
                    content: {
                        modelName: 'Rewards',
                        mod: 'Info',
                        model: rewardsCard,
                        className: 'rewards-info',
                        collection: App.Data.myorder,
                        points: rewardsCard.get('points'),
                        visits: rewardsCard.get('visits'),
                        purchases: rewardsCard.get('purchases')
                    }
                });

                this.change_page();
            });
        },
        initRevelAPI: function() {
            App.Routers.RevelOrderingRouter.prototype.initRevelAPI.apply(this, arguments);

            var RevelAPI = App.Data.RevelAPI,
                appName;

            if(!App.Data.dirMode) {
                appName = App.Data.get_parameters.appName ? decodeURIComponent(App.Data.get_parameters.appName) : App.Settings.brand_name;
                RevelAPI.set({
                    appName: /\w+'s(\s.*)?$/.test(appName) ? appName : 'the ' + appName,
                    appPossessiveName: /\w+'s(\s.*)?$/.test(appName) ? appName : appName + "'s",
                    appShortName: appName,
                    text1: MSG.BRAND_DIRECTORY_WELCOME_TEXT
                });
            }

            if(!RevelAPI.isAvailable()) {
                return;
            }

            this.listenTo(RevelAPI, 'onPayWithSavedCreditCard', function() {
                App.Data.card.set(RevelAPI.get('card').toJSON());
                App.Data.myorder.trigger('payWithCreditCard');
            }, this);

            this.listenTo(RevelAPI, 'onPayWithCustomCreditCard', function() {
                showDefaultCardView.call(this);
            }, this);
        }
    });

    function showDefaultCardView() {
        var paymentProcessor = App.Data.settings.get_payment_process();
        if(paymentProcessor.credit_card_dialog) {
            this.navigate('card', true);
        } else {
            App.Data.myorder.trigger('payWithCreditCard');
        }
    }

    return new main_router(function() {
        defaultRouterData();
        App.Routers.Router = Router;
    });
});
