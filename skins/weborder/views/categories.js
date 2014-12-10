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

define(["backbone", "factory", "generator", "list"], function(Backbone) {
    'use strict';

    App.Views.CategoriesView = {};

    App.Views.CategoriesView.CategoriesSliderItemView = App.Views.ItemView.extend({
        name: 'categories',
        mod: 'item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'change:active', this.show_hide, this);
            this.listenTo(this.collection, 'change:parent_selected', this.uncheck, this);
            this.show_hide();
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.afterRender.call(this, this.model.get('parent_sort'));
            return this;
        },
        events: {
            "change input": "change"
        },
        change: function() {
            var value = this.model.get('parent_name');
            this.collection.parent_selected = value;
            this.collection.selected = 0;
            this.collection.trigger('change:parent_selected', this.collection, value);
        },
        show_hide: function() {
            var value = this.model.get('parent_name');
            if (!this.collection.where({parent_name : value, active: true}).length) {
                this.$el.addClass('hide');
                this.options.self.update_slider_render();
            } else {
                this.$el.removeAttr('style');
                this.options.self.update_slider_render();
            }
        },
        uncheck: function(value) {
            if(this.collection.parent_selected != this.model.get('parent_name')) {
                this.$('input').prop('checked', false);
            }
        }
    });

    App.Views.CategoriesView.CategoriesSliderView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'slider',
        initialize: function() {
            this.parent_categories = [];
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'add', this.addItem, this);
            $(window).resize(this.create_slider.bind(this));
            this.listenTo(this.model, "loadCompleted", this.create_slider.bind(this));
            this.listenTo(this.model, 'onMenu', selectFirstItem, this);

            var self = this;
            this.options.loaded.then(selectFirstItem);

            function selectFirstItem() {
                self.$('input').first().trigger('change');
            }
        },
        events: {
            "change input": "change",
            "click .arrow_left": 'slide_left',
            "click .arrow_right": 'slide_right'
        },
        change: function(e) {
            var el = $(e.currentTarget),
                label = el.parents('label');

            el.parents('ul').find('label').removeClass('checked');
            label.addClass('checked');
        },
        render: function() {
            App.Views.ListView.prototype.render.apply(this, arguments);
            this.collection.each(this.addItem.bind(this));
            return this;
        },
        update_slider_render: function() {
            this.create_slider();
            if (this.$('.checked').parent().hasClass('hide')) {
                this.$('input').first().trigger('change');
            }
        },
        addItem: function(model) {
            if (this.parent_categories.indexOf(model.get('parent_name')) === -1) {
                this.parent_categories.push(model.get('parent_name'));
                var view = App.Views.GeneratorView.create('Categories', {
                    el: $('<li></li>'),
                    mod: 'SliderItem',
                    model: model,
                    collection: this.collection,
                    self: this
                }, model.cid);
                App.Views.ListView.prototype.addItem.call(this, view, this.$('.categories'), model.escape('parent_sort'));
                this.subViews.push(view);
                this.create_slider();
            }
        },
        create_slider: function() {
            var slider = this.$('.categories_slider'),
                wrapper = this.$('.slider_wrapper'),
                ul = this.$('.categories'),
                sliderWidth = slider.width(),
                lis = this.$('li').not('.hide'),
                elemWidth = lis.outerWidth();

            if (sliderWidth <= 0) {
                return;
            }
            this.slider_count = Math.floor(sliderWidth / elemWidth);
            this.slider_elem_count = lis.length;
            this.slider_index = this.slider_index || 0;
            this.slider_elem_width = elemWidth;

            wrapper.css('max-width', (elemWidth * Math.min(this.slider_count, this.slider_elem_count) - 1) + 'px'); // minus border and padding
            if (this.slider_elem_count < this.slider_count) {
                this.slider_index = 0;
            } else {
                this.slider_index = Math.min(this.slider_elem_count - this.slider_count, this.slider_index);
            }
            ul.css('left', -this.slider_index * this.slider_elem_width + 'px');

            this.update_slider();
        },
        update_slider: function() {
            var lis = this.$('li').not('.hide');
            lis.removeClass('first').removeClass('last');
            $(lis.get(this.slider_index)).addClass('first');
            $(lis.get(Math.min(this.slider_index + this.slider_count, this.slider_elem_count) - 1)).addClass('last');

            if (this.slider_index === 0) {
                this.$('.arrow_left').hide();
            } else {
                this.$('.arrow_left').show();
            }

            if (this.slider_count + this.slider_index >= this.slider_elem_count) {
                this.$('.arrow_right').hide();
            } else {
                this.$('.arrow_right').show();
            }
        },
        slide_right: function() {
            var ul = this.$('.categories');
            ul.css('left', -this.slider_index * this.slider_elem_width + 'px');
            this.slider_index++;
            ul.animate({
                left: "-=" + this.slider_elem_width
            });

            this.update_slider();
        },
        slide_left: function() {
            var ul = this.$('.categories');
            ul.css('left', -this.slider_index * this.slider_elem_width + 'px');
            this.slider_index--;
            ul.animate({
                left: "+=" + this.slider_elem_width
            });

            this.update_slider();
        }
    });

    App.Views.CategoriesView.CategoriesProductsItemView = App.Views.ItemView.extend({
        name: 'categories',
        mod: 'products_item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:active', this.show_hide);
            this.show_hide();
        },
        show_hide: function() {
            if (!this.model.get('active')) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.afterRender.call(this, this.model.get('sort'));
            this.add_table();
            this.listenTo(this.options.categories, 'change:selected', this.update_view);
            return this;
        },
        add_table: function() {
            var model = this.model,
                view = App.Views.GeneratorView.create('Product', {
                    mod: 'List',
                    collection: this.collection
                }, model.cid);
            this.$('.product_table').prepend(view.el);
            this.subViews.push(view);
        },
        update_view: function(model, value) {
            if (value === this.model.get('id')) {
                this.$el[0].scrollIntoView();
            }
        }
    });

    App.Views.CategoriesView.CategoriesProductsView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'products',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            var self = this,
                parent_name = this.collection.parent_selected,
                ids = this.collection.filter(function(model) {
                    return parent_name && model.get('parent_name') === parent_name;
                }).map(function(model) {
                    return model.get('id');
                });

            // Receives all products for current parent categories
            App.Collections.Products.get_slice_products(ids, this).then(function() {
                ids.forEach(function(id) {
                    self.addItem(App.Data.products[id], App.Data.categories.get(id));
                });
                self.trigger('loadCompleted');
                self.status = 'loadCompleted';
            });
            setTimeout(function() {
                self.trigger('loadStarted');
                self.status = 'loadStarted';
            }, 0);
        },
        addItem: function(products, category) {
            var view = App.Views.GeneratorView.create('Categories', {
                el: $('<li></li>'),
                mod: 'ProductsItem',
                collection: products,
                model: category,
                categories: this.collection
            }, category.cid);
            App.Views.ListView.prototype.addItem.call(this, view, this.$el, category.escape('sort'));
            this.subViews.push(view);
        }
    });

    App.Views.CategoriesView.CategoriesMainProductsView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'main_products',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'change:parent_selected', this.update_table);
            this.$('.categories_products_wrapper').contentarrow();
            this.$('.products_spinner').css('position', 'absolute').spinner();
        },
        update_table: function(model, value) {
            this.subViews.forEach(function(view) {
                this.stopListening(view);
            }, this);
            this.subViews.removeFromDOMTree();
            var view = App.Views.GeneratorView.create('Categories', {
                el: $("<ul class='categories_table'></ul>"),
                mod: 'Products',
                collection: this.collection
            }, value);
            this.subViews.push(view);
            this.$('.categories_products_wrapper').append(view.el);
            this.$(".categories_products_wrapper").scrollTop(0);
            this.listenTo(view, 'loadStarted', this.showSpinner, this);
            this.listenTo(view, 'loadCompleted', this.hideSpinner, this);
            if(view.status == 'loadCompleted') {
                this.hideSpinner(0);
            } else if(view.status == 'loadStarted') {
                this.showSpinner();
            }
        },
        showSpinner: function() {
            this.$('.products_spinner').addClass('ui-visible');
        },
        hideSpinner: function(delay) {
            var spinner = this.$('.products_spinner');
            setTimeout(spinner.removeClass.bind(spinner, 'ui-visible'), delay >= 0 ? delay : 500);
        },
        remove: function() {
            this.$('.categories_products_wrapper').contentarrow('destroy');
            App.Views.ListView.prototype.remove.apply(this, arguments);
        }
    });
});