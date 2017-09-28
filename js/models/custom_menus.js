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

	App.Models.CustomMenu = Backbone.Model.extend({
		defaults: {
			name: '',
			id: null,
			timetable: null
		},
		addJSON: function(data) {
			var timetable = new App.Models.Timetable({
                                timetables: [data.timetable],
                                holidays: []
                            });
			timetable.workingDay.update({
				start_time: 0,
                end_time: 0,
                delivery_time: 0,
                preparation_time: 0,
                pickup_time_interval: 15, //it does not play the role for checking_work_shop(), but it set just to exclude possible errors
				enable_asap: false, //the same
			});

			this.set({
				name: data.name,
				id: data.id,
				timetable: timetable
			});
		},
        is_available_for_time: function(pickup_time) {
        	//pickup_time is a server time
        	return this.get("timetable").checking_work_shop(pickup_time);
        }
	});

	App.Collections.CustomMenus = Backbone.Collection.extend({
	    model: App.Models.CustomMenu,
	    //Usage is:
        //var pickup = App.Data.myorder.checkout.get("pickupTS");
        //var ids = get_menus_for_time(pickup)
        get_menus_for_time: function(time) {
        	var result = [];
        	this.each(function(model) {
        		if (model.is_available_for_time(time)) {
                    result.push(model.id);
                }
        	});
        	return result;
		}
	});
})