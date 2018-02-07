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

/**
 * Contains {@link App.Models.WorkingDay}, {@link App.Models.Timetable} constructors.
 * @module timetable
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    var weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
//
// App.Models.WorkingDay model
//
// Use cases:
// var tt = new App.Models.Timetable(App.Data.settings.get("settings_system").timetables)
// var timetable = tt._get_timetable(new Date());
// var wd = new App.Models.WorkingDay({timetable: timetable['thursday'] })
// var options = wd.pickupTimeOptions({today: true});
// ...
// options = wd.pickupTimeOptions({today: false});
// ...
// wd.setTimetable( new_timetable )
// options = wd.pickupTimeOptions({today: false});
//

    /**
     * @class
     * @classdesc Represents working day model.
     * @alias App.Models.WorkingDay
     * @augments Backbone.Model
     * @example
     * // create a working day model
     * require(['timetable'], function() {
     *     var order = new App.Models.WorkingDay();
     * });
     */
    App.Models.WorkingDay = Backbone.Model.extend(
    /**
     * @lends App.Models.WorkingDay.prototype
     */
    {
        /**
         * The number of minutes between pickup time options.
         * @type {Number}
         * @default 0
         */
        pickup_time_interval: 0,
        /**
         * Number of minutes after start.
         * @type {Number}
         * @default 0
         */
        start_time: 0,
        /**
         * Number of minutes before end.
         * @type {Number}
         * @default 0
         */
        end_time: 0,
        /**
         * Order delivery time.
         * @type {Number}
         * @default 0
         */
        delivery_time: 0,
        /**
         * Order preparation time.
         * @type {Number}
         * @default 0
         */
        preparation_time: 0,
        /**
         * Enable ASAP option.
         * @type {Boolean}
         * @default true
         */
        enable_asap: true,
        defaults: {
            /**
             * Input param is like [{to:'06:00', from:'05:00'}, {to:'19:00', from:'07:00'}, {to:'23:00', from:'21:00'}].
             * If timetable = true or null => the store opened all the day.
             * If timetable = false  => the store is closed all the day.
             * @type {Array}
             * @default []
             */
            timetable: [],
            /**
             * Output param is pickup times array.
             * @type {Array}
             * @default []
             */
            options: [],
            /**
             * Time point for calculating pickup time.
             * @type {?string}
             * @default null
             */
            curTime: null
        },
        /**
         * Initializes the model.
         */
        initialize: function() {
            var times = App.Data.settings.get('settings_system');
            var pickup_time_interval = Math.abs(times.online_order_time_slot) || 1;
            var start_time = times.online_order_start_time_offset;
            var end_time = times.online_order_end_time_offset;
            var delivery_time = times.estimated_delivery_time;
            var preparation_time = times.estimated_order_preparation_time;
            var enable_asap = times.enable_asap_due_time;

            this.set('pickup_time_interval', pickup_time_interval);
            this.set('start_time', start_time);
            this.set('end_time', end_time);
            this.set('delivery_time', delivery_time);
            this.set('preparation_time', preparation_time);
            this.set('enable_asap', enable_asap);

        },
        /**
         * Updates models's attributes.
         * @param {object} data - Data to set.
         */
        update: function(data) {
            this.set(data);
        },
        /**
         * Returns offset time from current time to order ready time.
         * @param {?boolean} isDelivery - the order is for delivery or not.
         * @returns {number} - the amount of time (in milliseconds) required to prepare the order.
         */
        get_dining_offset: function(isDelivery) {
            if (isDelivery) {
                return this.get('delivery_time') * 60 * 1000;
            } else {
                return this.get('preparation_time') * 60 * 1000;
            }
        },
        /**
         * Store works all day long?
         * @returns {Boolean} - true, if store works all day
         * - false otherwise.
         */
        _isAllTheDay: function() {
            var timetable = this.get('timetable');

            return (timetable === null || timetable === true);
        },
        /**
         * Is store closed all day?
         * @returns {Boolean} - true, if store is closed all day
         * - false otherwise.
         */
        _isClosedToday: function() {
            var timetable = this.get('timetable');
            return (timetable === false || $.isArray(timetable) && timetable.length === 0);
        },
        /**
         * Internal function. Returns potential pickup times for single period.
         * @param   {string|Object}  period - can be string "all-the-day" or object in format like {from: 540, to: 750}
         * @param   {?boolean} isDelivery - the order is for delivery or not.
         * @returns {array} Array of possible pickup times for specified period.
         */
        _pickupTimesForPeriod: function(period, isDelivery) {
            var start_minutes, end_minutes,
                extra_time = (isDelivery ? this.get('delivery_time') : this.get('preparation_time')),
                start_interval = this.get('start_time') + extra_time,
                end_interval = (extra_time > this.get('end_time')) ? 0 : this.get('end_time') - extra_time,
                options = [];

            if (period === "all-the-day") {
                start_interval = 0;
                end_interval = 0;
                start_minutes = 0;
                end_minutes = 23 * 60 + 59;
            } else {
                start_minutes = period.from;
                end_minutes = period.to;
            }

            for (var min = start_minutes + start_interval; min <= end_minutes - end_interval; min += this.get('pickup_time_interval') ) {
                options.push(min);
            }

            return options;
        },
        /**
         * Merges periods and returns minutes equivalent.
         * E.g., from 09:00 to 11:30 and from 09:20 to 12:00 into from 540 to 750.
         * @param   {array} periods - Array of periods of time, e.g. [{from: "9:30", to: "14:00"}].
         * @returns {array} Array of periods of time converted to minutes, e.g. [{from: 570, to: 840}].
         */
        _unionPeriods: function(periods) {
            var sorted = deepClone(periods).
                    map(function(el) {
                        return {
                            from: new TimeFrm(0, 0, '24 hour').load_from_str(el.from).get_minutes(),
                            to: new TimeFrm(0, 0, '24 hour').load_from_str(el.to).get_minutes()
                        };
                    }).
                    sort(function(v1,v2) {
                        if (v1.from > v2.from) {
                            return 1;
                        } else if (v1.from === v2.from && v1.to > v2.to) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }),
                    i = 0;

            while (i < sorted.length - 1) {
                if (sorted[i].to > sorted[i + 1].from) {
                    sorted[i].to = Math.max(sorted[i].to, sorted[i + 1].to);
                    sorted.splice(i + 1, 1);
                } else {
                    i++;
                }
            }

            return sorted;
        },
        /**
         * Internal function - it returns potential pickup times for all timetable periods.
         * @param   {?boolean} isDelivery - the order is for delivery or not.
         * @returns {array} possible pickup times for all timetable periods.
         */
        _pickupSumTimes: function(isDelivery) {
            var self = this,
                timetable = this.get('timetable'),
                sum_pickup_times = [];

            if (this._isAllTheDay()) {
                //calc. the times for round-the-clock period or incorrect timetable
                return this._pickupTimesForPeriod( "all-the-day" );
            } else if (this._isClosedToday()) {
                return [];
            }

            this._unionPeriods(timetable).forEach( function(value) {
                sum_pickup_times = sum_pickup_times.concat(self._pickupTimesForPeriod(value, isDelivery) );
            });

            this.times = sum_pickup_times.sort(function(v1, v2) { return v1 - v2; });
            return this.times;
        },
        /**
         * Checks if shop works at curTime.
         * @param   {?boolean} isDelivery - the order is for delivery or not.
         * @returns {Boolean}
         * - true, if store is open;
         * - false, if store is closed.
         */
        checking_work_shop: function(isDelivery) {
            var timetable = this.get('timetable'),
                curtime = this.get('curTime');

            switch (timetable) {
                case null:
                case true:
                    return true;
                case false:
                    return false;
            }

            var works = false,
                start_interval = this.get('start_time'),
                end_interval = this.get('end_time') - (isDelivery ? this.get('delivery_time') : this.get('preparation_time')),
                time = new TimeFrm(curtime.getHours(), curtime.getMinutes()).get_minutes();

            this._unionPeriods(timetable).forEach(function(value) {
                if (value.from + start_interval <= time && time <= value.to - end_interval) {
                    works = true;
                }
            });
            return works;
        },

        /**
         * Returns pickup time options for dropdown list
         * @param   {object} params - Object with following params:
         * ```
         * {
         *     today: true|false,
         *     isDelivery: true|false|undefined
         * }
         * ```
         * @returns {array} - Array like ["ASAP", "10:30am", "10:45am", ...].
         * - "ASAP" option is presented in returned array if isToday = true AND store is not closed now and store is working now.
         * - ["closed"] - if the store is closed all day OR it's too late to make the order for today.
         */
        pickupTimeOptions: function(params) {
            /*
                today - true if timetable for current day;
                isDelivery - true if dinning_option is delivery
            */
            params = params || {};
            var options = [],
                isDelivery = params.isDelivery,
                t = new TimeFrm(0, 0),
                isToday = params.today,
                asap = false,
                offset = (this.get_dining_offset(isDelivery) / 60 / 1000),
                asap_text = _loc['TIME_PREFIXES']['ASAP'];
            var sel_time = !params.selected_time ? null :
                (params.selected_time.getHours() * 60 + params.selected_time.getMinutes());

            if (offset > 0) {
                asap_text += ' (' + offset + ' ' + _loc['TIME_PREFIXES']['MINUTES'] + ')';
            }

            // get pickup times grid potentially suited for the day
            var times = this._pickupSumTimes(isDelivery);

            if (isToday && times.length !== 0) {
                var curdate = new Date(this.get('curTime').getTime() + this.get_dining_offset(isDelivery)),
                    cur_min = curdate.getHours() * 60 + curdate.getMinutes();

                times = times.filter(function(value) {
                    return value > cur_min;
                });

                asap = times.length && (times[0] - cur_min) < Math.max(offset, App.Settings.online_order_time_slot);
            }

            if (times.length === 0) {
                var work_shop = this.checking_work_shop(isDelivery);

                this.set({
                    options: (isToday && work_shop && this.get('enable_asap')) ? [asap_text] : ['closed']
                });

                return this.get('options');
            }

            if (asap && this.get('enable_asap')) {
                options.push(asap_text);
            }

            for (var i = 0; i < times.length; i++) {
                options.push(t.set_minutes(times[i]).toString());
                if (sel_time === times[i]) {
                    params.get_selected_index = options.length - 1;
                }
            }

            this.set('options', options);
            return options;
        },
        /**
         * Finds the last pickup time available for the working period later than 'curtime'.
         * The working period is detemined by the case when period 'from' time < curtime < period 'to' time.
         * @param   {Date} curtime - current time.
         * @param   {?boolean} isDelivery - the order is for delivery or not.
         * @returns {object} Date object of the last pickup time available for the working period.
         */
        getLastPTforPeriod: function(curtime, isDelivery) {
            if (this._isAllTheDay()) {
                return "all-the-day";
            }

            var timetable = this._pickupSumTimes(isDelivery),
                lastPT = new Date(curtime.getTime()),

                hour, minutes,
                last_time = timetable.length && timetable[timetable.length - 1],
                cur_t = new TimeFrm(curtime.getHours(), curtime.getMinutes()).get_minutes();

            if (!last_time || last_time < cur_t) {
                return "not-found";
            } else {
                hour = parseInt( last_time / 60 );
                minutes = last_time % 60;

                lastPT.setHours( hour );
                lastPT.setMinutes( minutes );
                lastPT.setSeconds( 0 );
                return lastPT;
            }
        }
    });

    /**
     * @class
     * @classdesc Represents a timetable model.
     * @alias App.Models.Timetable
     * @augments Backbone.Model
     * @example
     * // create a timetable model
     * require(['timetable'], function() {
     *     var timetable = new App.Models.Timetable();
     * });
     */
    App.Models.Timetable = Backbone.Model.extend(
    /**
     * @lends App.Models.Timetable.prototype
     */
    {
        /**
         * Pickup time interval in milliseconds.
         * @type {number}
         * @default 900000 (15 minutes)
         */
        pickup_time_interval: 15 * 60 * 1000,
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Array of timetables (whole timetable. Dates couldn't be intersected).
             * @type {?array}
             * @default null
             */
            timetables: null,
            /**
             * Array of holidays.
             * @type {?array}
             * @default null
             */
            holidays: null,
            /**
             * Timezone offset in minutes.
             * @type {?number}
             * @default null
             */
            server_time: null,
            /**
             * Array of week days with working hours starting from current day.
             * @type {?array}
             * @default null
             */
            hours: null,
            /**
             * Time format used for week/day working hours output.
             * @type {string}
             * @default ''
             */
            time_format: ''
        },
        /**
         * Initializes the model.
         */
        initialize: function() {
            var times = App.Data.settings.get('settings_system'),
                hours;
            if (!this.get('timetables')) this.set('timetables', times.timetables);
            if (!this.get('holidays')) this.set('holidays', times.holidays);
            if (!this.get('time_format')) this.set('time_format', times.time_format);
            if (this.get('server_time') == null) this.set('server_time', times.server_time);
            this.workingDay = new App.Models.WorkingDay();
            (hours = this.getHoursOnWeek()) && this.set('hours', hours);
        },
        /**
         * Converts numeric representation of the day of the week to its name.
         * @param   {number} id_week - an integer corresponding to the day of the week: 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.
         * The same format as value returned by Date.prototype.getDay().
         * @returns {string} A name of the day of the week ("Monday", "Friday" etc).
         */
        get_day_of_week: function(id_week) {
            return weekDays[id_week];
        },
        /**
         * Shift time in the dependcy of the server time.
         * @param   {Date} base_time - it's a time without server's shift.
         * @returns {Date}
         */
        get_server_time: function(base_time) {
            return new Date(base_time.getTime() + this.get('server_time'));
        },
        /**
         * Gets base time.
         * @returns {Date} base time.
         */
        base: function() {
            return this.get_server_time(new Date());
        },
        /**
         * Gets base time - the same time as today but on the first day of the week,
         * depends on the server's setting 'Reports->week_start'
         * @returns {Date} base time of first week day.
         */
        get_base_time: function() {
            var base_time = new Date();
            // on server: week_start = 0 for Monday, in JS: 0 is Sunday
            var settingShift = (parseInt(App.Settings.week_start) + 1) % 7;

            base_time.setDate(base_time.getDate() - base_time.getDay() + settingShift);

            return this.get_server_time(base_time);
        },
        /**
         * current time including preparation time and delivery time
         */
        current_dining_time: function(isDelivery) {
            return new Date(this.base().getTime() + this.workingDay.get_dining_offset(isDelivery));
        },

        /**
         * Gets timetable on a particular day.
         * @param   {Date} current_date - real date.
         * @returns {?object|false}
         * - timetable object in following format:
         * ```
         * {
         *     "monday": [{
         *         "to": "19:59",
         *         "from": "00:00"
         *     }],
         *     "tuesday": [{
         *         "to": "23:52",
         *         "from": "00:00"
         *     }],
         *     ...
         * }
         * ```
         * - {};
         * - FALSE - always closed;
         * - TRUE - timetables is empty. - always open
         */
        _get_timetable: function(current_date) {
            var table = this.get('timetables'),
                parse, from_date, to_date, cur_date;

            if ((Array.isArray(table) && table.length == 0) || empty_object(table)) { // check object (empty or not empty)
                return true;
            }

            for (var i = 0, j = table.length; i < j; i++) {
                cur_date = new Date(current_date.getTime()); //#22327, to get ready for table[] is unsorted
                from_date = new Date(table[i].from_date);
                if ($.trim(table[i].to_date) == '') { //nonperiodic interval with open end date
                    if (cur_date >= from_date) {
                        return table[i].timetable_data;
                    }
                }
                if ($.trim(table[i].from_date) === '' && $.trim(table[i].to_date) === '') { //nonperiodic interval with open dates
                    return table[i].timetable_data;
                }
                else {
                    to_date = new Date(table[i].to_date);
                    if (from_date <= cur_date && cur_date <= to_date) {
                        return table[i].timetable_data;
                    }
                }
            }
            return false;
        },
        /**
         * Checks if current date is a holiday.
         * @param   {Date} cur_date - current date.
         * @returns {boolean}
         * - true - current date is a holiday.
         * - false - current date is not a holiday.
         */
        isHoliday: function(cur_date) {
            var self = this,
                holidays = this.get("holidays");
            if (holidays == null || !$.isArray(holidays) || !holidays.length) {
                return false;
            }
            if (!cur_date) {
                cur_date = this.base();
            }
            var cur_month = cur_date.getMonth() + 1,
                cur_day = cur_date.getDate(),
                month, day;

            for (var i = 0, len = holidays.length; i < len; i++) {
                month = /^[^,]{3}/.exec(holidays[i].date);
                month = month[0];
                day = /^[^\d]+(\d{1,2})/.exec(holidays[i].date);
                day = day[1];
                if (cur_month == MonthByStr[month] && cur_day == day) {
                    return true;
                }
            }
            return false;
        },
        /**
         * Gets an array of working hours on a particular day.
         * @param {Date} current_date - current date.
         * @param {number} [format_output=0] - format of time output:
         * - 0: applies `time_format` attribute value;
         * - 1: 24-hours format.
         * @returns {boolean, array or null}
         * - TRUE - around the clock;
         * - FALSE - closed;
         * - NULL - working hours are undefined. timetables is empty.
         */
        get_working_hours: function(current_date, format_output) {
            format_output = format_output === 1 ? 1 : 0;
            var timetable = this._get_timetable(new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate())); // get timetable on a particular day

            if (timetable === true) {
                return true; //always open
            }

            if (this.isHoliday(current_date) || timetable === false || empty_object(timetable)) {
                return false; //always closed
            }

            var current_day_timetable = timetable[weekDays[current_date.getDay()]],
                time_format = this.get('time_format');
            if (!current_day_timetable) {
                return false;
            }
            if (format_output) {
                return current_day_timetable;
            }

            var timetable_in_format = [];
            for (var i = 0; i < current_day_timetable.length; i++) {
                var time = current_day_timetable[i],
                    time_from = time.from.split(":"),
                    time_to = time.to.split(":"),
                    h_from = parseInt(time_from[0]),
                    m_from = parseInt(time_from[1]),
                    h_to = parseInt(time_to[0]),
                    m_to = parseInt(time_to[1]);

                timetable_in_format.push({
                    from: new TimeFrm(h_from, m_from, time_format).toString(), // output of time in requirement format
                    to: new TimeFrm(h_to, m_to, time_format).toString(), // output of time in requirement format
                    from_int: h_from * 60 + m_from,
                    to_int: h_to * 60 + m_to
                });

            }
            return timetable_in_format;
        },
        /**
         * Gets timetable on the week from the current day.
         * @param {number} format_output - format of time output:
         * - 0: applies `time_format` attribute value;
         * - 1: 24-hours format.
         * @returns {?object}
         * - timetable object in following format:
         * ```
         * {
         *    "sunday": false,
         *    "monday": [{
         *        "from": "0:00",
         *        "to": "19:59"
         *    }],
         *    "tuesday": [{
         *        "from": "0:00",
         *        "to": "23:52"
         *    }],
         *    ...
         * }
         * ```
         * - null, if timetable is empty.
         */
        get_timetable_on_week: function(format_output) {
            format_output = format_output === 1 ? 1 : 0;
            var timetable = {},
                processing_date = this.get_base_time(), // need to create new, not link (current_date = today)
                current_day_of_week;

            for (var i = 0; i <= 6; i++) {
                current_day_of_week = weekDays[processing_date.getDay()];
                // get an array of working hours on a particular day. send copy of date not date referrer
                timetable[current_day_of_week] = this.get_working_hours(new Date(processing_date), format_output);
                if (timetable[current_day_of_week] === null) {
                    return null;
                }
                processing_date.setDate(processing_date.getDate() + 1);
            }
            return timetable;
        },
        /**
         * Gets working hours for each day of the week.
         * @returns {array} Array of timetables per day, e.g.
         * ```
         * [{
         *      "weekDay": "sunday",
         *      "hours": false
         * }, {
         *      "weekDay": "monday",
         *      "hours": [{
         *          "from": "0:00",
         *          "to": "19:59"
         *      }]
         * }, {
         *      "weekDay": "tuesday",
         *      "hours": [{
         *          "from": "0:00",
         *          "to": "23:52"
         *      }]
         * },
         *  ...
         * ]
         * ```
         */
        getHoursOnWeek: function() {
            var timetable_on_week = this.get_timetable_on_week(),
                timetable;

            if(timetable_on_week !== null && Object.keys(timetable_on_week).length > 1) {
                timetable = [];
                var today = this.get_base_time().getDay();
                for(var i = today; i < today + 7; i++) {
                    var weekDay = this.get_day_of_week(i % 7);
                    timetable.push({
                        weekDay: weekDay,
                        hours: timetable_on_week[weekDay]
                    });
                }
            }

            return timetable;
        },
        /**
         * Returns working hours for the current date.
         * @returns {?object}
         */
        getCurDayHours: function() {
            var hours = this.get('hours');
            if (!hours) {
                return null;
            }
            var weekDay = this.get_day_of_week(this.base().getDay() % 7);
            for (var i in hours) {
                if (hours[i].weekDay == weekDay) {
                    return hours[i];
                }
            }
            return null;
        },
        /**
         * Checks if shop works at a specified time.
         * @param   {Date} current_time - current time.
         * @param   {?boolean} isDelivery - the order is for delivery or not.
         * @returns {boolean}
         * - true, if store is open.
         * - false, if store is closed.
         */
        checking_work_shop: function(current_time, isDelivery) {
            this.workingDay.update({timetable: this.get_working_hours(current_time, 1), curTime : current_time});
            return this.workingDay.checking_work_shop(isDelivery);
        },
        /**
         * Returns given date with hours, minutes and seconds set to 00:00:00.
         * @param   {Date} date - Date to round.
         * @returns {Date} rounded date.
         */
        round_date: function(date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        },
        /**
         * Gets lists "Pickup Date and Pickup Time".
         * Usage:
         * ```
         * var out_obj = {};
         * var list = timetable.getPickupList(true, out_obj);
         * // list[out_obj[1]] - is tommorow day (if store is not closed for tommorow, otherwise out_obj[1] is undefined)
         * ```
         * @param   {?boolean} isDelivery - the order is for delivery or not.
         * @param   {object}  index_by_day_delta - an object which recieves data mapping the delta in days (between cur date and target date) into an index of the array returned by getPickupList.
         * It is needed beacause getPickupList does not returns invalid days within a App.Settings.online_order_date_range period (which timetable is not set (closed) or holidays).
         * @returns {array} an array of valid days with pickup time grids.
         */
        getPickupList: function(isDelivery, index_by_day_delta, sel_time) {
            var self = this, check_day, isToday,
                now = this.base(), key_index = 0,
                day = now.getDay();
            var days = [];
            var date_range = App.Settings.online_order_date_range;
            for (var i = 0; i < date_range; i++) {
                check_day = new Date(now.getTime() + i * MILLISECONDS_A_DAY);
                isToday = (i === 0);
                if (this.isWorkingOnDay(check_day, isDelivery, isToday)) {
                    if (index_by_day_delta) {
                        index_by_day_delta[i] = key_index++;
                    }
                    days.push({day: weekDays[(day + i) % 7], index: i});
                }
            }
            sel_time = sel_time ? new Date(sel_time) : null;

            return days.map(function(ob_day) {
                var date = new Date(now.getTime() + ob_day.index * MILLISECONDS_A_DAY),
                    weekDay = (ob_day.index >= 2) ? ob_day.day : ob_day.index ? _loc['DAYS']['TOMORROW'] : _loc['DAYS']['TODAY'],
                    month = _loc.ARRAY_MONTH[date.getMonth()],
                    _date = date.getDate();
                switch (_date.toString().match(/1?\d$/)[0]) {
                    case "1":
                        _date += _loc['TIME_PREFIXES']['FIRST_DAY_OF_MONTH'];
                        break;
                    case "2":
                        _date += _loc['TIME_PREFIXES']['SECOND_DAY_OF_MONTH'];
                        break;
                    case "3":
                        _date += _loc['TIME_PREFIXES']['THIRD_DAY_OF_MONTH'];
                        break;
                    default:
                        _date += _loc['TIME_PREFIXES']['OTHER_DAY_OF_MONTH'];
                        break;
                }
                if (~weekDays.indexOf(weekDay)) {
                    weekDay = _loc['DAYS_OF_WEEK'][weekDay];
                }

                this.workingDay.update({timetable: self.get_working_hours(date, 1), curTime : self.base()});
                var options = {
                    today: (weekDay === _loc['DAYS']['TODAY']),
                    isDelivery: isDelivery,
                    selected_time: (!sel_time ? null :
                        (sel_time.getDate() === date.getDate() && sel_time.getMonth() === date.getMonth()) ?
                        sel_time :
                        null)
                };
                var working_day = this.workingDay.pickupTimeOptions(options); // set flag "Today" for creating the list of time intervals
                var retData = {
                    weekDay: weekDay + (ob_day.index >=2 ? ', ' + month + ' ' + _date : ''),
                    date: self.round_date(date),
                    workingDay: working_day,
                    delta: ob_day.index
                };
                if (options.get_selected_index) {
                    retData.selected_index = options.get_selected_index;
                }
                return retData;
            }, self);
        },
        /**
         * Check if the store is working on a specific day
         * @param {Object} day
         * @param {Boolean} isDelivery
         * @param {Boolean} isToday
         * return {Boolean}
         */
        isWorkingOnDay: function(day, isDelivery, isToday) {
            var hours = this.get_working_hours(day),
                result = false;

            if (hours === true) {
                return true; //all the day case
            } else if (!(hours instanceof Array) || !hours.length) {
                return result; //closed
            }

            var now = this.base().getTime(),
                delivery_time = App.Settings.estimated_delivery_time,
                preparation_time = App.Settings.estimated_order_preparation_time,
                extra_time = (isDelivery ? delivery_time : preparation_time) * 60 * 1000; // in milliseconds

            for(var i in hours) {
                var item = hours[i];

                if (typeof item !== 'object') {
                    break;
                }

                var time_prefix = _loc['TIME_PREFIXES'],
                    rexp = new RegExp(time_prefix['TIME_AM'] + "|" + time_prefix['TIME_PM'], 'i');

                var has_am_pm = (item.from.search(rexp) !== -1);

                var from = (has_am_pm ? new TimeFrm().load_from_str(item.from).toString('24 hour') : item.from).split(':'),
                    from_h = parseInt(from[0]),
                    from_m = parseInt(from[1]);

                var to = (has_am_pm ? new TimeFrm().load_from_str(item.to).toString('24 hour') : item.to).split(':'),
                    to_h = parseInt(to[0]),
                    to_m = parseInt(to[1]);

                day.setHours(from_h, from_m, 0, 0);
                var start = day.getTime();

                day.setHours(to_h, to_m, 0, 0);
                var end = day.getTime();

                var nowInside = isToday && start <= now && now <= end,
                    duration = end - (nowInside ? now : start);

                if (isToday && !nowInside && now > end) {
                    duration = 0;
                }

                if (duration >= extra_time) {
                    result = true;
                    break;
                }
            }

            return result;
        },
        /**
         * Finds the last pickup time available for the working period later than 'curtime'.
         * @param   {Date} current_time - current time.
         * @returns {Date}
         */
        getLastPTforWorkPeriod: function(curtime) {
            var wd = new App.Models.WorkingDay( {timetable: this.get_working_hours(curtime, 1),
                                                 curTime : curtime});

            return wd.getLastPTforPeriod(curtime);
        },
        /**
         * Checks if store accepts orders at this moment. It's true if store is open or accepts online orders when it's closed.
         * @param   {?boolean} isDelivery - the order is for delivery or not.
         * @returns {boolean}
         * - true, if store accepts orders.
         * - false otherwise.
         */
        check_order_enable: function(isDelivery) {
            var currentTime = this.base(),

                working = this.checking_work_shop(currentTime, isDelivery),
                accept = App.Data.settings.get('settings_system').accept_online_orders_when_store_is_closed;

             if (!working && !accept) {
                return false;
            } else {
                return true;
            }
        },
        /**
         * Checks if store is open now.
         * @returns {boolean}
         * - true, if store is open;
         * - false, if store is closed.
         */
        openNow: function() {
            if(this.isHoliday()) {
                return false;
            }

            return this.checking_work_shop(this.base());
        },
        /**
         * Checks whether the store is closed today or not
         * @returns {boolean} `true` if the store is closed today.
         */
        isClosedToday: function() {
            return this.workingDay && this.workingDay._isClosedToday();
        },
        /**
         * @returns {string} One of the following strings:
         *      'Open Today: <period 1>, <period 2>, ..., <period N>',
         *      'Round the clock',
         *      'Closed'
         */
        getWorkingHoursToday: function() {
            var day = this.getCurDayHours(),
                res = _loc.STORE_INFO_CLOSED;

            if (_.isObject(day)) {
                if (day.hours instanceof Array && day.hours.length > 0) {
                    res = [];
                    day.hours.forEach(function(day, i) {
                        res.push(day.from + ' - ' + day.to);
                    });
                    res = _loc.STORE_INFO_OPEN_TODAY + ': ' + res.join(', ');
                } else if(day.hours) {
                    res = _loc.STORE_INFO_ROUND_THE_CLOCK;
                }
            }

            return res;
        },
        /*
         * Get TODAY according to server's time
         * @returns {time} date-time of today (time is set to 00:00:00)
         */
        today: function() {
            var t = this.get_server_time(new Date());
            t.setHours(0, 0, 0 ,0);
            return t;
        },
        /*
         * Format date to 'Day_of_week_short, MM/DD/YYYY', like 'Fri, 08/12/2017'
         * @returns {string} formatted date
         */
        format_date: function(date) {
            date = new Date(date);
            return _loc.PIKADAY.i18n.weekdaysShort[date.getDay() % 7] + ', ' +
                   ('0' + date.getDate()).slice(-2) + '/' +
                   ('0' + (date.getMonth() + 1)).slice(-2) + '/' +
                   date.getFullYear();
        }
    });

    /*
     * Extends App.Models.Timetable to support product's timetables
     */

    App.Models.ProductTimeTable = App.Models.Timetable.extend({
        /*
         * Set timetables (schedule_timetables) for product's schedule.
         * If timetable_data is empty, it means 24 hours * 7 days.
         * That's why it's substituted with 00:00 - 23:59 periods for all week days.
         * When not empty, it's used 'as is'.
         * @param {type} timetables for the product
         *
         */
        set_schedule: function(timetables) {
            for (var i in timetables) {
                if (!_.isEmpty(timetables[i].timetable_data)) {
                    continue;
                }
                for (var j in weekDays) {
                    timetables[i].timetable_data[weekDays[j]] = [{
                        from: '00:00',
                        to: '23:59'
                    }];
                }
            }
            this.set('schedule_timetables', timetables);
        },
        /*
         * Gets time of product's availiability (schedule).
         *
         * products' timetables is an array, containing timetables of all custom menus
         * to which this product belongs to
         *
         * @param {Date} date - the date when we like to get product's hours
         *
         * @returns {array} all periods of availiability; could be empty array
         * every period has the same format as function get_working_hours()
         */
        get_product_hours: function(date) {
            var timetables = this.get('schedule_timetables'),
                ranges = [],
                date_from,
                date_to;
            var weekDay = this.get_day_of_week(date.getDay() % 7);

            if (this.isHoliday(date)) {
                return ranges;
            }

            for (var i in timetables) {
                if (!timetables[i].active) {
                    continue;
                }
                date_from = timetables[i].from_date ?
                    new Date(timetables[i].from_date).setHours(0, 0, 0, 0) :
                    new Date(this.get_base_time()).setHours(-2400, 0, 0, 0); // -100 days
                date_to = timetables[i].to_date ?
                    new Date(timetables[i].to_date).setHours(23, 59, 59, 999) :
                    new Date(this.get_base_time()).setHours(2400, 0, 0, 0); // +100 days

                // check if date is in the range [date_from, date_to]
                if (date < date_from || date > date_to) {
                    continue;
                }

                for (var j in timetables[i]['timetable_data'][weekDay]) {
                    var from = this.str_to_time(timetables[i]['timetable_data'][weekDay][j]['from']),
                        to   = this.str_to_time(timetables[i]['timetable_data'][weekDay][j]['to']);
                    if (from === null || to === null) {
                        continue;
                    }
                    ranges.push({from_int: from, to_int: to});
                }
            }

            // check if ranges of hours have intersections; combine if required
            if (ranges.length > 1) {
                var changed = false;

                do {
                    changed = false;
                    if (ranges.length == 1) {
                        continue;
                    }
                    for (var i = 0; i < ranges.length - 1 && !changed; i++) {
                        for (var j = i+1; j < ranges.length; j++) {
                            // check if 2 ranges could be combined
                            if ((ranges[j].to_int >= ranges[i].from_int) && (ranges[j].to_int <= ranges[i].to_int) ||
                                    (ranges[j].from_int >= ranges[i].from_int) && (ranges[j].from_int <= ranges[i].to_int) ||
                                    (ranges[i].to_int >= ranges[j].from_int) && (ranges[i].to_int <= ranges[j].to_int) ||
                                    (ranges[i].from_int >= ranges[j].from_int) && (ranges[i].from_int <= ranges[j].to_int)) {
                                ranges[i].from_int = Math.min(ranges[i].from_int, ranges[j].from_int);
                                ranges[i].to_int = Math.max(ranges[i].to_int, ranges[j].to_int);
                                ranges.splice(j, 1);
                                changed = true;
                                break;
                            }
                        }
                    }
                } while (changed);
            }

            for (var i in ranges) {
                ranges[i].from = this.time_to_str(ranges[i].from_int);
                ranges[i].to = this.time_to_str(ranges[i].to_int);
            }

            return ranges;
        },
        /*
         * Gets product hours for the whole week
         * @param {date} date on the week
         * @returns {timetable} timetable with ranges, combined from all available schedule_timetables
         */
        get_product_week: function(date) {
            var timetable_data = {};
            date = date || new Date();

            var startDay = new Date(date.setDate(date.getDate() - date.getDay())),
                currentDay = new Date();
            var keep_format = this.get('time_format');
            this.set('time_format', '24 hour');

            for (var i = 0; i < 7; i++) {
                var day = new Date(currentDay.setDate(startDay.getDate() + i));
                var weekDay = day.getDay();
                var timetable_day = this.get_product_hours(day);
                timetable_data[weekDays[weekDay]] = timetable_day ? timetable_day : [];
            }

            this.set('time_format', keep_format);
            return [{timetable_data: timetable_data}];
        },
        /*
         * convert time (string representation) to minutes
         * @param {string} str, like '13:00', 24-h format
         * @returns {integer} minutes since midnight;
         * '13:00' -> 780
         */
        str_to_time: function(str) {
            var time = str && str.split && str.split(':');
            if (!time || (Array.isArray(time) && time.length != 2) ) {
                return null;
            }
            return parseInt(time[0]) * 60 + parseInt(time[1]);
        },
        /*
         * convert time (minutes) to string representation
         * @param {integer} time
         * @returns {string}, like '13:00' if 24-h format is used
         */
        time_to_str: function(time) {
            time = parseInt(time);
            var h = Math.floor(time/60);
            var m = time - h * 60;

            return new TimeFrm(h, m, this.get('time_format')).toString();
        },
        /*
         * Check if product is available for ordering at requested date-time
         */
        available: function() {
            var date = App.Data.mainModel && App.Data.mainModel.get('orderStarted') ?
                new Date(App.Data.myorder.checkout.get('pickupTS')):
                this.base();
            var time = date.getHours() * 60 + date.getMinutes();
            var working = this.get_working_hours(date), // in could be true, false or an array
                saling =  this.get_product_hours(date); // it is an array always, could be empty array
            var in_working_time = (working === true);

            // check if time is inside working time range(s)
            if (!in_working_time) {
                for (var i in working) {
                    if (this.time_in_range(working[i], time)) {
                        in_working_time = true;
                        break;
                    }
                }
            }
            if (!in_working_time) {
                return false;
            }

            // check if time is inside saling time range(s)
            for (var i in saling) {
                if (this.time_in_range(saling[i], time)) {
                    return true;
                }
            }

            return false;
        },
        time_in_range: function(range, time) {
            if (range.from_int <= time && time <= range.to_int) {
                return true;
            }
            return false;
        }
    });
});
