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

define(["backbone", "factory", "generator", "list", 'products_view'], function(Backbone) {
    'use strict';

    App.Views.ProductView.ProductModifiersView = App.Views.CoreProductView.CoreProductModifiersView.extend({
        render: function() {
           App.Views.CoreProductView.CoreProductModifiersView.prototype.render.apply(this, arguments);
           this.product.get('is_gift') && this.$el.addClass('is_gift');
        }
    });

    App.Views.ProductView.ProductListItemView = App.Views.LazyItemView.extend({
        name: 'product',
        mod: 'list_item',
        initialize: function() {
            App.Views.LazyItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:active', this.show_hide);
            this.show_hide();
        },
        render: function() {
            var model = this.model.toJSON();
            model.hide_images = App.Data.settings.get('settings_system').hide_images;
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            model.price = round_monetary_currency(model.price);
            model.price_length = model.price.length + model.currency_symbol.length;
            model.show_product_description = !App.Data.settings.get('settings_system').hide_products_description;
            model.uom = App.Data.settings.get("settings_system").scales.default_weighing_unit;
            model.isDefaultImage = model.image == App.Data.settings.get_img_default();
            this.$el.html(this.template(model));
            return this;
        },
        events: {
            "click": "showModifiers"
        },
        showModifiers: function(e) {
            e.preventDefault();
            var id_category = this.model.get('id_category'),
                id = this.model.get('id');
            App.Data.router.navigate("modifiers/" + id_category + "/" + id, true);
        },
        show_hide: function() {
            if (!this.model.get('active')) {
                this.$el.addClass('hide');
            } else {
                this.$el.removeClass('hide');
            }
        }
    });

    App.Views.ProductView.ProductListView = App.Views.LazyListView.extend({
        name: 'product',
        mod: 'list',
        initialize: function() {
            App.Views.LazyListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'load_complete', this.render, this);
        },
        render: function() {
            this.collection.sortEx();
            App.Views.LazyListView.prototype.render.apply(this, arguments);
            return this;
        },
        addItem: function(model) {
            if (model.get("attribute_type") == 2) { // to hide child products
                return;
            }
            var settings = App.Data.settings.get('settings_system'),
                noImg = settings.hide_images,
                noDesc = settings.hide_products_description,
                view;
            view = App.Views.GeneratorView.create('Product', {
                el: $('<li class="product"></li>'),
                mod: 'ListItem',
                model: model
            }, 'product_' + model.cid);
            noDesc && view.$el.addClass('short');
            noImg && view.$el.addClass('no-image');

            App.Views.LazyListView.prototype.addItem.call(this, view, this.$('.products'));
            this.culcImageSize(model);
            this.subViews.push(view);
            $(window).resize();
        },
        culcImageSize: function(model) {
            if (!this.preferWidth || !this.preferHeight) {
                this.preferWidth = Math.round($("#content .img").width());
                this.preferHeight = Math.round($("#content .img").height());
            }
            
            var logo_url = model.get(this.image_url_key);
            var options = '?options={"size":[' + this.preferWidth + "," +  this.preferHeight + "]}";
            var logo_url_sized = logo_url + options;

            if (App.Data.settings.get_img_default() != logo_url) {
                logo_url = logo_url_sized;
            }
            //model.set("logo_url_final", logo_url);
            model.set("image", logo_url);
        }
    });
});