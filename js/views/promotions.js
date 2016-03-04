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

define(['factory'], function() {
    'use strict';

    App.Views.CorePromotionsView = {};
    App.Views.CorePromotionsView.CorePromotionsTopLineView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'TopLine',
        events: {
            'click': 'goToPromotionsList'
        },
        goToPromotionsList: function() {
            App.Data.router.navigate('promotions', true);
        }
    });

    App.Views.CorePromotionsView.CorePromotionsListItemView = App.Views.ItemView.extend({
        name: 'promotions',
        mod: 'ListItem',
        tagName: 'li',
        bindings: {
            '.promotion__name': 'text: name',
            '.promotion__link': 'toggle: available',
            '.promotion__description': 'toggle: not(available), text: info',
            '.promotion__add': 'text: select(selected, _loc.PROMOTION_ADDED, _loc.PROMOTION_ADD), classes: {added: selected, disabled: not(available)}',
        },
        events: {
            'click .promotion__link': 'seeInfo',
            'click .promotion__add:not(.disabled)': 'add'
        },
        /**
         * Applies discount to the order.
         */
        add: function(e) {
            e.stopPropagation();
            this.model.set('selected', !this.model.get('selected'));
        },
        /**
         * Navigates to promotion details screen.
         */
        seeInfo: function() {
            App.Data.router.navigate('promotion/' + this.model.get('discountId'), true);
        }
    });

    App.Views.CorePromotionsView.CorePromotionsMyItemView = App.Views.CorePromotionsView.CorePromotionsListItemView.extend({
        mode: 'MyItem',
        bindings: _.extend({}, App.Views.CorePromotionsView.CorePromotionsListItemView.prototype.bindings, {
            '.promotion__add': 'text: select(selected, _loc.PROMOTION_APPLIED, _loc.PROMOTION_APPLY), classes: {added: selected, disabled: not(available)}',
            '.promotion__reusable': 'text: select(multiple, _loc.PROMOTION_MULTIPLE_USE, _loc.PROMOTION_SINGLE_USE)'
        })
    });

    App.Views.CorePromotionsView.CorePromotionsListView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'list',
        initialize: function() {
            // need to add model.available and model.other to bindingSource to provide handlers for 'reset', 'add', 'remove' events.
            this.bindingSources = _.extend({}, this.bindingSources, {
                _available: this.model.get('available'),
                _other: this.model.get('other')
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.promotions-available': 'collection: $_available',
            '.promotions-other': 'collection: $_other'
        },
        itemView: App.Views.CorePromotionsView.CorePromotionsListItemView
    });

    App.Views.CorePromotionsView.CorePromotionsMyView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'my',
        initialize: function() {
            // need to add model.available and model.other to bindingSource to provide handlers for 'reset', 'add', 'remove' events.
            this.bindingSources = _.extend({}, this.bindingSources, {
                _available: this.model.get('available')
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.promotions-available': 'collection: $_available'
        },
        itemView: App.Views.CorePromotionsView.CorePromotionsMyItemView
    });

    App.Views.CorePromotionsView.CorePromotionsItemView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'item',
        bindings: {
            '.promotion-details__title-text': 'text: discountTitle',
            '.promotion-details__discount-code': 'text: discountCode'
        }
    });

    return new (require('factory'))(function() {
        App.Views.PromotionsView = {};
        App.Views.PromotionsView.PromotionsListView = App.Views.CorePromotionsView.CorePromotionsListView;
        App.Views.PromotionsView.PromotionsListItemView = App.Views.CorePromotionsView.CorePromotionsListItemView;
        App.Views.PromotionsView.PromotionsMyView = App.Views.CorePromotionsView.CorePromotionsMyView;
        App.Views.PromotionsView.PromotionsItemView = App.Views.CorePromotionsView.CorePromotionsItemView;
        App.Views.PromotionsView.PromotionsTopLineView = App.Views.CorePromotionsView.CorePromotionsTopLineView;
    });
});
