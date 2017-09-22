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

    App.Views.CoreUpfrontView = {};

    App.Views.CoreUpfrontView.CoreUpfrontMainView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'main'
    });

    App.Views.CoreUpfrontView.CoreUpfrontPageView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'page',
//        bindings: {
//            show_page: {
//                get: function() {
//                    return App.Data.myorder.get('is_upfront_active');
//                }
//            }
//        },
        initialize: function() {
            App.Views.Factory.prototype.initialize.apply(this, arguments);
            console.log('initializing Upfront page view!!!');
            this.listenTo(App.Data.myorder.get('is_upfront_active'), this.showUpfront, this);
        },
        showUpfront: function() {
            this.applyBindings();
        }

    });

    App.Views.CoreUpfrontView.CoreUpfrontOrderTypeView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'order_type',
        bindings: {
            ':el': 'toggle: not(equal(dining_option, "DINING_OPTION_ONLINE"))',
            '.select-wrapper': 'classes: { "no-arrows": hide_arrows }',
            '.order-type-select': 'value: diningOption, options: dining_options'
        },
        computeds: {
            hide_arrows: function() {
                var opts = this.getBinding('dining_options');
                return opts.length <= 1;
            },
            dining_options: function() {
                var opts = [];
                if (_.isObject(this.options.DINING_OPTION_NAME)) {
                    opts = _.map(this.options.DINING_OPTION_NAME, function(value, key) {
                        return {label: value, value: key};
                    });
                }
                return opts;
            },
            /**
             * Need to use the computed value because 'DINING_OPTION_ONLINE' is not presented in 'dining_options' computed array. Bug #44273
             */
            diningOption: {
                deps: ['dining_option', 'selected_dining_option'],
                get: function(dining_option, selected_dining_option) {
                    return dining_option == 'DINING_OPTION_ONLINE' ? selected_dining_option : dining_option;
                },
                set: function(value) {
                    var dining_options = this.getBinding('dining_options');

                    if (!value && dining_options.length) {
                        value = dining_options[0].value;
                    }

                    this.model.set('dining_option', value);
                }
            }
        }
    });

    App.Views.CoreUpfrontView.CoreUpfrontPickupView = App.Views.FactoryView.extend({
        name: 'upfront',
        mod: 'pickup',
        initialize: function() {
            var self = this;

            this.listenTo(this.model, 'change:dining_option', this.listenOrderType, this);

            this.listenTo(this.model, 'hide:datepicker', function() {
                self.picker.hide();
            }, this);

            this.templateData = {
                isFirefox: /firefox/i.test(navigator.userAgent)
            };

            this.isDelivery = this.model.get('dining_option') === 'DINING_OPTION_DELIVERY';
            this.pickupTimeIndexByDelta = {};
            this.pickupTime = this.options.timetable.getPickupList(this.isDelivery, this.pickupTimeIndexByDelta);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenOrderType(null, this.model.get('dining_option'));
        },
        render: function() {
            var days;
            var self = this;

            this.templateData.pickupTimeLabel = '';
            this.$el.html(this.template(this.templateData));

            var today = new Date();
            today.setHours(0,0,0,0);
            if (this.pickupTime.length == 0) {
                return this;
            }
            var field = this.$('#datepicker');

            this.picker = new Pikaday({
                field: field[0],
                minDate: this.pickupTime[0].date,
                maxDate: this.pickupTime[this.pickupTime.length - 1].date,
                position: 'bottom hcenter',
                firstDay : _loc['PIKADAY']['FIRST_DAY'],
                i18n: _loc['PIKADAY']['i18n'],
                onSelect: selectDate
            });

            function selectDate(date) {
                var one_day = 1000 * 60 * 60 * 24;
                var diffDays = parseInt((date - today) / one_day);
                switch (diffDays) {
                   case 0:
                      field.val(_loc['DAYS']['TODAY']);
                      break;
                   case 1:
                      field.val(_loc['DAYS']['TOMORROW']);
                      break;
                   default:
                      field.val(date.format()); //field.val(date.format("Dd, Mm dd"));
                }
                field.data("day", diffDays);
                self.changeDay({target: { value: diffDays }});
            }

            selectDate(this.pickupTime[0].date);

            return this;
        },
        events: {
            'change select.time': 'changeTime'
        },
        changeDay: function(e) {
            var index = e.target.value*1, workingDay,
                day_index = this.pickupTimeIndexByDelta[index];

            if (day_index != undefined) {
                workingDay = this.pickupTime[day_index].workingDay;
            }
            else {
                workingDay = ['closed'];
            }

            var time = this.$('select.time'),
                label = time.parent();

            label.removeAttr('disabled');
            time.removeAttr('disabled');
            time.empty();

            workingDay.forEach(function(value, i) {
                time.append('<option value="' + i + '">' + (value !== "closed" ? value : 'The store is closed') + '</option>');
                if(value === "closed") {
                    time.attr('disabled', 'disabled');
                    label.attr('disabled', 'disabled');
                }
            });

            this.model.set('pickupDay',index);
            this.changeTime({target: { value : 0 }});
        },
        changeTime: function(e) {
            var index = e.target.value*1,
                day = this.$('input.pikaday').data("day"),
                day_index = this.pickupTimeIndexByDelta[day],
                time, date;

                if (day_index != undefined) {
                    time = this.pickupTime[day_index].workingDay[index];
                    date = this.pickupTime[day_index].date;
                }
                else {
                    time = 'closed';
                }

            var format = new TimeFrm,
                pickupTS, isPickupASAP = false;

            this.model.set('pickupTimeReview',index);

            if(time && time.indexOf(_loc['TIME_PREFIXES']['ASAP']) != -1) {
                pickupTS = App.Data.timetables.base().getTime();
                isPickupASAP = true;
            } else if (time === 'closed') {
                pickupTS = null;
            } else {
                format = new TimeFrm(0, 0);
                format.load_from_str(time);
                var timeSplit = format.toString('24 hour').split(':');
                pickupTS = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeSplit[0], timeSplit[1]).getTime();
            }
            this.model.set({
                'pickupTS': pickupTS,
                'isPickupASAP': isPickupASAP
            });
            return time;
        },
        setPickupDay: function() {
            var pickupDay = this.model.get('pickupDay') || 0,
                pickupTime = this.model.get('pickupTimeReview') || 0,
                day = this.$('input.pikaday'),
                pikaday =  this.$('input.pikaday');

            day.data("day", pickupDay);
            this.changeDay({target: { value: pickupDay }});
            this.model.set('pickupTimeReview', pickupTime);
            this.setPickupTime();
        },
        setPickupTime: function() {
            var pickup = this.model.get('pickupTimeReview') || 0,
                time = this.$('select.time');

            time.val(pickup);
            this.changeTime({target: {value: pickup }});
        },
        listenOrderType: function(model, value) {
            this.isDelivery = this.model.get('dining_option') === 'DINING_OPTION_DELIVERY';
            this.pickupTimeIndexByDelta = {};
            this.pickupTime = this.options.timetable.getPickupList(this.isDelivery, this.pickupTimeIndexByDelta);
            if (value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_OTHER') {
                this.$('.pickup').text(_loc.CONFIRM_DELIVERY_TIME);
            } else {
                this.$('.pickup').text(_loc.CONFIRM_ARRIVAL_TIME);
            }

            if (value === 'DINING_OPTION_ONLINE' || value == 'DINING_OPTION_SHIPPING') {
                this.$el.hide();
            } else {
                this.$el.show();
            }
            this.setPickupDay();
        }
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
//        bindings: {
//            ':el': 'toggle: not(equal(dining_option, "DINING_OPTION_ONLINE"))',
//            '.select-wrapper': 'classes: { "no-arrows": hide_arrows }',
//            '.order-type-select': 'value: diningOption, options: dining_options'
//        },
//        computeds: {
//            hide_arrows: function() {
//                var opts = this.getBinding('dining_options');
//                return opts.length <= 1;
//            },
//            dining_options: function() {
//                var opts = [];
//                if (_.isObject(this.options.DINING_OPTION_NAME)) {
//                    opts = _.map(this.options.DINING_OPTION_NAME, function(value, key) {
//                        return {label: value, value: key};
//                    });
//                }
//                return opts;
//            },
//            /**
//             * Need to use the computed value because 'DINING_OPTION_ONLINE' is not presented in 'dining_options' computed array. Bug #44273
//             */
//            diningOption: {
//                deps: ['dining_option', 'selected_dining_option'],
//                get: function(dining_option, selected_dining_option) {
//                    return dining_option == 'DINING_OPTION_ONLINE' ? selected_dining_option : dining_option;
//                },
//                set: function(value) {
//                    var dining_options = this.getBinding('dining_options');
//
//                    if (!value && dining_options.length) {
//                        value = dining_options[0].value;
//                    }
//
//                    this.model.set('dining_option', value);
//                }
//            }
//        }
    });

    return new (require('factory'))(function() {
        App.Views.UpfrontView = {};
        App.Views.UpfrontView.UpfrontMainView = App.Views.CoreUpfrontView.CoreUpfrontMainView;
        App.Views.UpfrontView.UpfrontPageView = App.Views.CoreUpfrontView.CoreUpfrontPageView;
        App.Views.UpfrontView.UpfrontOrderTypeView = App.Views.CoreUpfrontView.CoreUpfrontOrderTypeView;
        App.Views.UpfrontView.UpfrontPickupView = App.Views.CoreUpfrontView.CoreUpfrontPickupView;
        App.Views.UpfrontView.UpfrontActionsView = App.Views.CoreUpfrontView.CoreUpfrontActionsView;
    });
});
