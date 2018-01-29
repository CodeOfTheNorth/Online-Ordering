define([], function() {
    return {

        "times1": [
            600,
            620
        ],
        "times2": [
            0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200,
            220, 240, 260, 280, 300, 320, 340, 360, 380, 400,
            420, 440, 460, 480, 500, 520, 540, 560, 580, 600,
            620, 640, 660, 680, 700, 720, 740, 760, 780, 800,
            820, 840, 860, 880, 900, 920, 940, 960, 980, 1000,
            1020, 1040, 1060, 1080, 1100, 1120, 1140, 1160, 1180,
            1200, 1220, 1240, 1260, 1280, 1300, 1320, 1340, 1360, 1380, 1400, 1420
        ],
        "times3": [
            600,
            620,
            640,
            660
        ],
        "times4": [
            "10:00am",
            "10:20am"
        ],
        "month" : [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        "weekDays" : ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        "getTimetable" : {
            "wednesday" : 0,
            "thursday" : 1,
            "friday" : 2,
            "saturday" : 3,
            "sunday" : 4,
            "monday" : 5,
            "tuesday" : 6
        },
        "timetable": [
            {
                "from_date": "Jan 1, 2014",
                "to_date": "Jan 1, 2014",
                "timetable_data": {}
            },
            {
                "from_date": "Feb 1, 2014",
                "to_date": "Feb 3, 2014",
                "timetable_data": {}
            },
            {
                "from_date": "Apr 1, 2014",
                "to_date": "Apr 23, 2014",
                "timetable_data": {
                    "monday": [
                        {
                            "from": "12:26",
                            "to": "23:59"
                        }
                    ],
                    "tuesday": [
                    ],
                    "wednesday": [
                        {
                            "from": "00:00",
                            "to": "23:59",
                            "from_int": 0,
                            "to_int": 1439
                        },
                        {
                            "from": "10:00",
                            "to": "12:00",
                            "from_int": 600,
                            "to_int": 720
                        }
                    ],
                    "wednesday12": [
                        {
                            "from": "12:00am",
                            "to": "11:59pm",
                            "from_int": 0,
                            "to_int": 1439
                        },
                        {
                            "from": "10:00am",
                            "to": "12:00pm",
                            "from_int": 600,
                            "to_int": 720
                        }
                    ],
                    "wednesday13": [
                        {
                            "from": "0:00",
                            "to": "23:59",
                            "from_int": 0,
                            "to_int": 1439
                        },
                        {
                            "from": "10:00",
                            "to": "12:00",
                            "from_int": 600,
                            "to_int": 720
                        }
                    ],
                    "thursday": [
                        {
                            "from": "00:00",
                            "to": "10:00",
                            "from_int": 0,
                            "to_int": 600
                        },
                        {
                            "from": "15:00",
                            "to": "20:00",
                            "from_int": 900,
                            "to_int": 1200
                        }
                    ],
                    "friday": [
                        {
                            "from": "10:00",
                            "to": "16:00",
                            "from_int": 600,
                            "to_int": 960
                        },
                        {
                            "from": "00:00",
                            "to": "13:00",
                            "from_int": 0,
                            "to_int": 780
                        }
                    ],
                    "saturday": [
                    ]
                }
            }
        ],
        "timetable2": [
            {
                "from_date": "Dec 20, 2013",
                "to_date": "Jan 20, 2014",
                "timetable_data": {
                    "monday": [
                        {
                            "from": "12:26",
                            "to": "23:59",
                            "from_int": 746,
                            "to_int": 1439
                        }
                    ],
                    "tuesday": [
                    ],
                    "wednesday": [
                        {
                            "from": "00:00",
                            "to": "23:59",
                            "from_int": 0,
                            "to_int": 1439
                        },
                        {
                            "from": "10:00",
                            "to": "12:00",
                            "from_int": 600,
                            "to_int": 720
                        }
                    ],
                    "wednesday12": [
                        {
                            "from": "12:00am",
                            "to": "11:59pm",
                            "from_int": 720,
                            "to_int": 1439
                        },
                        {
                            "from": "10:00am",
                            "to": "12:00pm",
                            "from_int": 600,
                            "to_int": 720
                        }
                    ],
                    "thursday": [
                        {
                            "from": "00:00",
                            "to": "10:00",
                            "from_int": 0,
                            "to_int": 600
                        },
                        {
                            "from": "15:00",
                            "to": "20:00",
                            "from_int": 900,
                            "to_int": 1200
                        }
                    ],
                    "friday": [
                        {
                            "from": "10:00",
                            "to": "16:00",
                            "from_int": 600,
                            "to_int": 960
                        },
                        {
                            "from": "00:00",
                            "to": "13:00",
                            "from_int": 0,
                            "to_int": 780
                        }
                    ],
                    "saturday": [
                    ]
                }
            }
        ],
        "timetable3": [
            {
                "from_date": "Dec 20, 2013",
                "to_date": "Jan 20, 2014",
                "timetable_data": {}
            }
        ],
        "timetable4": [
            {
                "from_date": "Jan 1, 2014",
                "to_date": "Jan 5, 2014",
                "timetable_data": {
                    "wednesday" : [{
                        "from": "00:00",
                        "to": "23:59"
                    }],
                    "thursday": [{
                        "from": "00:00",
                        "to": "23:59",
                    }],
                    "friday": [{
                        "from": "00:00",
                        "to": "23:59"
                    }]
                }
            },
            {
                "from_date": "Feb 1, 2014",
                "to_date": "Feb 3, 2014",
                "timetable_data": {}
            },
            {
                "from_date": "Feb 10, 2014",
                "to_date": "Feb 14, 2014",
                "timetable_data": {
                    "monday": [
                        {
                            "from": "12:26",
                            "to": "23:59"
                        }
                    ],
                    "tuesday": [
                    ],
                    "wednesday": [
                        {
                            "from": "00:00",
                            "to": "23:59"
                        },
                        {
                            "from": "10:00",
                            "to": "12:00"
                        }
                    ]
                }
            }
        ],
        "timetable5": [
            {
                "from_date": "Jan 1, 2014",
                "to_date": "Dec 31, 2014",
                "timetable_data": {}
            }
        ],
        "timetable6": [
            {
                "from_date": "Apr 1, 2014",
                "to_date": "",
                "timetable_data": {}
            },
            {
                "from_date": "Jan 30, 2014",
                "to_date": "",
                "timetable_data": {
                    "wednesday": [
                        {
                            "from": "00:00",
                            "to": "23:59"
                        },
                        {
                            "from": "10:00",
                            "to": "12:00"
                        }
                    ]
                }
            }
        ]
    };
});
