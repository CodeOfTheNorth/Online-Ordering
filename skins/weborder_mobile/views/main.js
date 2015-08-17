﻿/*
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

define(["done_view", "generator"], function(done_view) {
    'use strict';

    var MainView = App.Views.FactoryView.extend({
        name: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:content', this.content_change, this);
            this.listenTo(this.model, 'change:header', this.header_change, this);
            this.listenTo(this.model, 'loadStarted', this.loadStarted, this);
            this.listenTo(this.model, 'loadCompleted', this.loadCompleted, this);
            this.listenTo(this.model, 'showRevelPopup', this.showRevelPopup, this);
            this.listenTo(this.model, 'hideRevelPopup', this.hideRevelPopup, this);
            this.listenToOnce(this.model, 'showSpinnerAndHideContent', this.showSpinnerAndHideContent, this); // show a spinner and hide a content
            this.listenTo(this.model, 'change:isBlurContent', this.blurEffect, this); // a blur effect of content
            this.listenTo(this.model, 'resizeSection', this.resizeSection, this);
            this.listenTo(this.model, 'restoreSection', this.restoreSection, this);

            this.iOSFeatures();

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            initSizes();
            this.$('#main-spinner').css({
                'font-size': App.Data.getSpinnerSize() + 'px',
                'height': '100%',
                'width': '100%'
            }).spinner();
            this.showSpinner();
            // #fix for bug 9841
            this.$el.on('touchend', 'input[type=text], input[type=number], input[type=tel]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).focus();
            });
            this.iOSSafariCaretFix();
            // Fix for #16070
            this.$el.on("focusin", function () {
                setTimeout(function(){
                    var title = $('h1.title');
                    title.text(title.text());
                },0);
            })
            return this;
        },
        content_change: function() {
            var view, content = this.$('#section'),
                data = this.model.get('content'),
                content_defaults = this.content_defaults();

            while(this.subViews.length > 1) {
                view = this.subViews.pop();
                view.removeFromDOMTree();
            }

            if(Array.isArray(data))
                data.forEach(function(data) {
                    content.append(this.addContent(data));
                }, this);
            else
                content.append(this.addContent(data));

            content.scrollTop(0);
            this.setContentPadding();
        },
        header_change: function() {
            var data = _.defaults(this.model.get('header'), this.header_defaults()),
                $header = this.$('#header');
            this.subViews[0] && this.subViews[0].removeFromDOMTree();
            this.subViews[0] = App.Views.GeneratorView.create(data.modelName, data);
            $header.append(this.subViews[0].el);
            this.setContentPadding();
        },
        header_defaults: function() {
            return {
                model: App.Data.header,
                modelName: 'Header'
            }
        },
        content_defaults : function() {
            return {
                // className : 'content'
            };
        },
        addContent: function(data, removeClass) {
            var id = 'content_' + data.modelName + '_' + data.mod;
            data = _.defaults(data, this.content_defaults());

            if(data.cacheIdUniq) {
                id += '_' + data.cacheIdUniq;
            }

            if(removeClass)
                delete data.className;

            var subView = App.Views.GeneratorView.create(data.modelName, data, data.cacheId ? id : undefined);
            if(this.subViews.length > 1)
                this.subViews.push(subView);
            else
                this.subViews[1] = subView;

            return subView.el;
        },
        iOSFeatures: function() {
            if(/iPad|iPod|iPhone/.test(window.navigator.userAgent))
                document.addEventListener('touchstart', new Function, false); // enable css :active pseudo-class for all elements
        },
        loadCompleted: function() {
            $(window).trigger('loadCompleted');
            clearTimeout(this.spinner);
            delete this.spinner;

            this.hideSpinner();
        },
        loadStarted: function() {
            this.spinner = setTimeout(this.showSpinner.bind(this), 50);
        },
        showSpinner: function() {
            this.blurBg();
            this.$('#main-spinner').show();
        },
        hideSpinner: function() {
            this.unblurBg();
            this.$('#main-spinner').hide();
        },
        showRevelPopup: function(data) {
            var container = this.$('#revel-popup');
            container.css({display: 'table'});
            this.blurBg();
            this.revelView = App.Views.GeneratorView.create(data.modelName, data, data.cacheId);
            this.subViews.push(this.revelView);
            container.append(this.revelView.el);
        },
        hideRevelPopup: function() {
            this.$('#revel-popup').hide();
            this.unblurBg();
            this.revelView && this.revelView.removeFromDOMTree();
        },
        blurBg: function() {
            this.$('section, footer, header').addClass('blur');
        },
        unblurBg: function() {
            this.$('section, footer, header').removeClass('blur');
        },
        /**
         * Show a spinner and hide a content.
         */
        showSpinnerAndHideContent: function() {
            this.showSpinner(); // show spinner
            this.$('header, section, footer').hide();
        },
        /**
         * A blur effect of content.
         * Blur effect supported on Firefox 35, Google Chrome 18, Safari 6, iOS Safari 6.1, Android browser 4.4, Chrome for Android 39.
         */
        blurEffect: function() {
            // http://caniuse.com/#search=filter
            this.model.get('isBlurContent') ? this.blurBg() : this.unblurBg();
        },
        resizeSection: function(rows) {
            var className = 'footer-sections-' + rows;
            this.$('#section').addClass(className);
            if(!Array.isArray(this.resizeSection.classes)) {
                this.resizeSection.classes = [];
            }
            this.resizeSection.classes.push(className);
        },
        restoreSection: function() {
            this.$('#section').removeClass(this.resizeSection.classes.join(' '));
            this.resizeSection.classes.length = 0;
        },
        setContentPadding: function() {
            var top = Array.prototype.reduce.call(this.$('.fixed-top'), iteration, 0),
                bottom = Array.prototype.reduce.call(this.$('.fixed-bottom'), iteration, 0);

            this.$('#section').css({
                'padding-top': top + 'px',
                'padding-bottom': bottom + 'px',
            });

            function iteration(iterRes, item) {
                return iterRes + (Backbone.$(item).height() || 0);
            }
        }
    });

    function initSizes() {
        var w = 640,
            h = 700,
            fsDefault = 10,
            fsMin = 4,
            coef = 1,
            resizing = false,
            interval;

        function resize() {
            resizing = true;
            var wW = $(window).width(),
                wH = $(window).height(),
                wCoef = wW / w,
                hCoef = wH / h;
            if (wCoef > hCoef) {
                coef = hCoef;
            }
            else {
                coef = wCoef;
            }

            var fontSize = Math.round(fsDefault * coef);
            if (fontSize < fsMin) {
                fontSize = fsMin;
            }

            $('body').css('font-size', fontSize);
            resizing = false;
        };

        $(window).resize(function() {
            !resizing && resize();

            if (document.activeElement.tagName.toLowerCase() == "input") {
                document.activeElement.scrollIntoView(); // #18707
            }
        });

        resize();
    }

    return new (require('factory'))(done_view.initViews.bind(done_view), function() {
        App.Views.MainView.MainMainView = MainView;
    });
});
