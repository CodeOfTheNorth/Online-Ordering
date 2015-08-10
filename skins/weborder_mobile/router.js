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
    }

    var Router = App.Routers.RevelOrderingRouter.extend({
        routes: {
            "": "index",
            "index": "index",
            // "search": "search",
            "products/:ids": "products",
            "modifiers/:id_category(/:id_product)": "modifiers",
            // "modifiers_edit/:index": "modifiers_edit",
            // "myorder": "myorder",
            // "checkout" : "checkout",
            // "card" : "card",
            // "giftcard" : "gift_card",
            // "stanfordcard": "stanford_card",
            // "stanford_is_student": "stanford_is_student",
            // "stanford_student_verification": "stanford_student_verification",
            // "confirm": "confirm",
            // "done": "done",
            // "location": "location",
            // "map": "map",
            // "about": "about",
            // "gallery": "gallery",
            // "maintenance": "maintenance",
            // "pay": "pay",
            // "profile(/:step)": "profile",
            // "loyalty": "loyalty",
            // "rewards_card_submit": "rewards_card_submit",
            // "rewards": "rewards",
            // "*other": "index"
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
                App.Data.footer = new Backbone.Model();
                var mainModel = App.Data.mainModel = new App.Models.MainModel();
                var ests = App.Data.establishments;

                // init RevelAPI
                this.initRevelAPI();

                // only establishment with reward cards option enabled can show RevelAPI buttons
                App.Settings.RevelAPI = App.Settings.RevelAPI && App.Settings.enable_reward_cards_collecting;

                // listen to credit card payment
                this.listenTo(App.Data.footer, 'payWithCreditCard', function() {
                    if(App.Settings.RevelAPI) {
                        App.Data.RevelAPI.checkCreditCard();
                    } else {
                        showDefaultCardView.call(this);
                    }
                }, this);

                this.listenTo(App.Data.myorder, 'payWithCreditCard', function() {
                    var paymentProcessor = App.Data.settings.get_payment_process();
                    if(paymentProcessor.credit_card_dialog) {
                        App.Data.myorder.check_order({
                            order: true,
                            tip: true,
                            customer: true,
                            checkout: true,
                            card: true
                        }, sendRequest);
                    } else {
                        sendRequest();
                    }

                    function sendRequest() {
                        saveAllData();
                        mainModel.trigger('loadStarted');
                        App.Data.myorder.create_order_and_pay(PAYMENT_TYPE.CREDIT);
                    }
                });

                new App.Views.MainView.MainMainView({
                    model: mainModel,
                    el: 'body'
                });
//common
                this.listenTo(this, 'showPromoMessage', this.showPromoMessage, this);
//common
                this.listenTo(this, 'hidePromoMessage', this.hidePromoMessage, this);
//common
                this.listenTo(this, 'needLoadEstablishments', this.getEstablishments, this); // get a stores list
//common
                this.listenTo(ests, 'resetEstablishmentData', this.resetEstablishmentData, this);
                this.listenTo(ests, 'resetEstablishmentData', mainModel.trigger.bind(mainModel, 'showSpinnerAndHideContent'), this);
//common
                this.listenTo(ests, 'clickButtonBack', mainModel.set.bind(mainModel, 'isBlurContent', false), this);

                // init Stanford Card model if it's turned on
                if(_.isObject(App.Settings.payment_processor) && App.Settings.payment_processor.stanford) {
                    App.Data.stanfordCard = new App.Models.StanfordCard();
                }

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
        navigationControl: function() {
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
        showPromoMessage: function() {
            App.Data.footer.set('isShowPromoMessage', true);
            App.Data.mainModel.trigger('showPromoMessage');
        },
        hidePromoMessage: function() {
            App.Data.footer.set('isShowPromoMessage', false);
            App.Data.mainModel.trigger('hidePromoMessage');
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
                    back: App.Data.dirMode ? this.navigateDirectory.bind(this) : null
                });

                App.Data.mainModel.set({
                    header: headerModes.Main,
                    content: {
                        modelName: 'Categories',
                        collection: App.Data.parentCategories,
                        mod: 'Parents',
                        cacheId: true
                    }
                });

                if(App.Data.categories.loadData.state() == 'resolved')
                    this.change_page();

                App.Data.settings.load_geoloc();
            });
        },
        search: function() {
            var self = this;
            this.prepare('search', function() {
                // load content block for categories
                if (!App.Data.categories) {
                    App.Data.categories = new App.Collections.Categories();
                    App.Data.categories.loadData = App.Data.categories.get_categories();
                    App.Data.categories.loadData.then(function() {
                        App.Data.categories.trigger("load_complete");
                        self.change_page();
                    });
                }

                if (!App.Data.search) {
                    App.Data.search = new App.Collections.Search();
                }
                if (!App.Data.searchLine) {
                    App.Data.searchLine = new App.Models.SearchLine({search: App.Data.search});
                }
                var header = {
                    page_title: _loc['HEADER_SEARCH_PT'],
                    back_title: _loc['HEADER_SEARCH_BT'],
                    back: self.navigate.bind(self, 'index', true)
                };
                App.Data.header.set(header);

                App.Data.mainModel.set({
                    header: headerModes.Search,
                    footer: footerModes.Main,
                    content: [
                        {
                            modelName: 'SearchLine',
                            model: App.Data.searchLine,
                            mod: 'Spinner',
                            className: 'content search_line',
                            cacheId: true
                        },
                        {
                            modelName: 'Product',
                            model: App.Data.searchLine,
                            collection: new App.Collections.Products(),
                            search: App.Data.search,
                            mod: 'SearchList',
                            className: 'content search_list custom-scroll',
                            cacheId: true,
                            content_elem: '#content .search_list'
                        }
                    ]
                });

                if(App.Data.categories.loadData.state() == 'resolved')
                    this.change_page();
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
                    back: self.navigate.bind(self, 'index', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Main
                });

                // load categories and products
                $.when(this.initCategories(), App.Collections.Products.get_slice_products(_ids)).then(function() {
                    var parentCategory = App.Data.parentCategories.findWhere({ids: ids}),
                        subs = parentCategory.get('subs');

                    !fetched[ids] && subs.each(function(category) {
                        var products = App.Data.products[category.get('id')];
                        category.get('products').reset(products ? products.toJSON() : []);
                    });

                    fetched[ids] = true;

                    App.Data.mainModel.set({
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
                    setHeaderToUpdate();
                    showProductDetails();
                } else {
                    setHeaderToAdd();
                    order.add_empty(id_product * 1, id_category * 1).then(showProductDetails);
                }

                header.set({
                    page_title: _loc.CUSTOMIZE,
                    back: back,
                    cart: cart
                });

                App.Data.mainModel.set({
                    header: headerModes.Modifiers,//App.Settings.online_orders ? headerModes.Modifiers : Backbone.$.extend(headerModes.Modifiers, {className: 'one_button'}),
                });

                function showProductDetails() {
                    if(!isEditMode) {
                        order = order.clone();
                    }

                    App.Data.mainModel.set({
                        content: {
                            modelName: 'MyOrder',
                            model: order,
                            mod: 'Matrix',
                            cacheId: true,
                            cacheIdUniq: id_category.toString() + id_product
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
                        link_title: _loc.UPDATE,
                        link: header.updateProduct.bind(header, order, order.clone())
                    });
                }

                function setHeaderToAdd() {
                    header.set({
                        link_title: _loc.ADD_TO_CART,
                        link: function() {
                            header.addProduct(order);
                            self.listenTo(order, 'change', setHeaderToUpdate);
                        }
                    });
                }
            });
        },
        modifiers_edit: function(index) {
            index = parseInt(index);
            this.prepare('modifiers', function() {
                var self = this,
                    _order = App.Data.myorder.at(index),
                    order;

                if(!_order)
                    return this.navigate('myorder', true);

                order = _order.clone();

                App.Data.header.set({
                    page_title: _loc['HEADER_MODIFIERS_PT'],
                    back_title: _loc['HEADER_MODIFIERS_BT'],
                    forward_title: _loc['HEADER_MODIFIERS_EDIT_FT'],
                    back: this.navigate.bind(this, 'myorder', true),
                    forward: function() {
                        var check = order.check_order();

                        if (check.status === 'OK') {
                            order.get_product().check_gift(function() {
                                App.Data.myorder.remove(_order);
                                App.Data.myorder.add(order, {at: index});
                                App.Data.router.navigate("index", true);
                            }, function(errorMsg) {
                                App.Data.errors.alert(errorMsg); // user notification
                            });
                        } else {
                            App.Data.errors.alert(check.errorMsg); // user notification
                        }
                    }
                });

                App.Data.mainModel.set({
                    header: headerModes.Modifiers,
                    footer: footerModes.Modifiers,
                    content: {
                        modelName: 'MyOrder',
                        model: order,
                        mod: 'Matrix'
                    }
                });

                this.change_page();
            });
        },
        myorder: function() {
            this.prepare('myorder', function() {
                App.Data.header.set({
                    page_title: _loc['HEADER_MYORDER_PT'],
                    back_title: _loc['HEADER_MYORDER_BT'],
                    forward_title: _loc['HEADER_MYORDER_FT'],
                    back: this.navigate.bind(this, 'index', true),
                    forward: this.navigate.bind(this, 'checkout', true)
                });

                var isNote = App.Data.settings.get('settings_system').order_notes_allow;

                App.Data.mainModel.set({
                    header: headerModes.Myorder,
                    footer: footerModes.Myorder,
                    content: [
                        {
                            modelName: 'MyOrder',
                            collection: App.Data.myorder,
                            mod: 'List',
                            className: 'myorderList custom-scroll' + (isNote ? ' isNote' : '')
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            mod: 'DiscountCode2',
                            className: 'discountBlock' + (isNote ? ' isNote' : ''),
                            myorder: App.Data.myorder
                        },
                        {
                            modelName: 'Total',
                            model: App.Data.myorder.total,
                            mod: 'Main',
                            className: 'myorderSubtotal' + (isNote ? ' isNote' : ''),
                            collection: App.Data.myorder
                        },
                        {
                            modelName: 'MyOrder',
                            model: App.Data.myorder.checkout,
                            mod: 'Note',
                            className: 'myorderNote'
                        }
                    ]
                });

                this.change_page();
            });
        },
        checkout: function() {
            this.prepare('checkout', function() {
                var RevelAPI = App.Data.RevelAPI;

                if(!App.Data.card)
                    App.Data.card = new App.Models.Card({RevelAPI: RevelAPI});

                if(!App.Data.giftcard)
                    App.Data.giftcard = new App.Models.GiftCard;

                if(!App.Data.customer) {
                    App.Data.customer =  new App.Models.Customer({RevelAPI: RevelAPI});
                    App.Data.customer.loadAddresses();
                }

                App.Data.header.set({
                    page_title: _loc['HEADER_CHECKOUT_PT'],
                    back_title: _loc['HEADER_CHECKOUT_BT'],
                    back: this.navigate.bind(this, 'myorder', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Checkout,
                    footer: footerModes.Checkout,
                    content: [
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            collection: App.Data.myorder,
                            mod: 'OrderType',
                            DINING_OPTION_NAME: _loc.DINING_OPTION_NAME,
                            className: 'checkout'
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            customer: App.Data.customer,
                            rewardsCard: App.Data.myorder.rewardsCard,
                            mod: 'Main',
                            className: 'checkout'
                        },
                        {
                            modelName: 'Checkout',
                            model: App.Data.myorder.checkout,
                            timetable: App.Data.timetables,
                            mod: 'Pickup',
                            className: 'checkout'
                        }
                    ]
                });

                this.change_page();
            });
        },
        card: function() {
            this.prepare('card', function() {
                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                App.Data.header.set({
                    page_title: _loc['HEADER_CARD_PT']
                });

                App.Data.mainModel.set({
                    header: headerModes.Card,
                    footer: footerModes.Card,
                    content: {
                        modelName: 'Card',
                        model: App.Data.card,
                        mod: 'Main'
                    }
                });

                this.change_page();
            });
        },
        gift_card: function() {
            this.prepare('giftcard', function() {
                if(!App.Data.giftcard)
                    App.Data.giftcard = new App.Models.GiftCard;

                App.Data.header.set({
                    page_title: _loc['HEADER_GIFT_CARD_PT']
                });

                App.Data.mainModel.set({
                    header: headerModes.GiftCard,
                    footer: footerModes.GiftCard,
                    content: {
                        modelName: 'GiftCard',
                        model: App.Data.giftcard,
                        mod: 'Main'
                    }
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
        confirm: function() {
            var load = $.Deferred();
            if (App.Data.myorder.length === 0) {
                load = this.loadData();
            } else {
                load.resolve();
            }

            this.prepare('confirm', function() {
                var payments = App.Data.settings.get_payment_process();

                if(!App.Data.card)
                    App.Data.card = new App.Models.Card;

                App.Data.header.set({
                    page_title: _loc['HEADER_CONFIRM_PT'],
                    back_title: _loc['HEADER_CONFIRM_BT'],
                    back: this.navigate.bind(this, 'checkout', true)
                });

                App.Data.footer.set('payments', payments);

                App.Data.mainModel.set({
                    header: headerModes.Confirm,
                    footer: _.extend(footerModes.Confirm, {
                        payments: new Backbone.Model(payments),
                        checkout: App.Data.myorder.checkout,
                        mainModel: App.Data.mainModel
                    }),
                    content: [
                        {
                            modelName: 'Total',
                            model: App.Data.myorder.total,
                            mod: 'Checkout',
                            collection: App.Data.myorder
                        },
                        {
                            modelName: 'Tips',
                            model: App.Data.myorder.total.get('tip'),
                            mod: 'Line',
                            total: App.Data.myorder.total,
                            cacheIt: true
                        }
                    ]
                });

                this.change_page();
            }, [load]);
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
            this.prepare('done', function() {

                // if App.Data.customer doesn't exist (success payment -> history.back() to #confirm -> history.forward() to #done)
                // need to init it.
                if(!App.Data.customer) {
                    this.loadCustomer();
                }

                var params = App.Data.myorder.paymentResponse;
                var isSuccess = params.status === 'OK';

                App.Data.header.set('page_title', isSuccess ? _loc['HEADER_DONE_SUCCESS_PT'] : _loc['HEADER_DONE_FAILURE_PT']);
                App.Data.footer.set({success_payment: isSuccess});

                App.Data.mainModel.set({
                    header: headerModes.Done,
                    footer: footerModes.Done,
                    content: {
                        modelName: 'Main',
                        model: App.Data.mainModel,
                        mod: "Done",
                        className: 'done'
                    }
                });

                this.change_page();
            });
        },
        location: function() {
            var settings = App.Data.settings.get('settings_system');

            this.prepare('store_info', function() {

                App.Data.header.set({
                    page_title: (settings instanceof Object) ? settings.business_name : _loc['HEADER_LOCATION_PT'],
                    back_title: _loc['HEADER_LOCATION_BT'],
                    forward_title: _loc['HEADER_LOCATION_FT'],
                    back: this.navigate.bind(this, 'index', true),
                    forward: this.navigate.bind(this, 'map', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Location,
                    footer: footerModes.Location,
                    content: {
                        modelName: 'StoreInfo',
                        model: App.Data.timetables,
                        mod: 'InDetails'
                    }
                });

                this.change_page();
            });
        },
        map: function() {
            this.prepare('store_info', function() {

                App.Data.header.set({
                    page_title: _loc['HEADER_MAP_PT'],
                    back_title: _loc['HEADER_MAP_BT'],
                    back: this.navigate.bind(this, 'location', true)
                });

                App.Data.mainModel.set({
                    header: headerModes.Map,
                    footer: footerModes.Map,
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
            var settings = App.Data.settings,
                settings_system = settings.get('settings_system'),
                model = new Backbone.Model({
                    logo: settings_system.logo_img ? settings.get('host') + settings_system.logo_img : null,
                    text: settings_system.about_description || 'No information',
                    title: settings_system.about_title || '',
                    clientName: window.location.origin.match(/\/\/([a-zA-Z0-9-_]*)\.?/)[1]
                });

            this.prepare('store_info', function() {
                var images = App.Data.settings.get('settings_system').about_images,
                    header = headerModes.About;

                App.Data.header.set({
                    page_title: _loc['HEADER_ABOUT_PT'] + ' ' + App.Data.settings.get('settings_system').business_name,
                    back_title: _loc['HEADER_ABOUT_BT'],
                    back: this.navigate.bind(this, 'index', true),
                    forward_title: _loc['HEADER_ABOUT_FT'],
                    forward: this.navigate.bind(this, 'gallery', true)
                });

                if(!Array.isArray(images) || !images.length)
                    header = headerModes.BackToMenu;

                App.Data.mainModel.set({
                    header: header,
                    footer: footerModes.About,
                    content: {
                        modelName: 'StoreInfo',
                        model: model,
                        mod: 'About',
                        className: 'about'
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
