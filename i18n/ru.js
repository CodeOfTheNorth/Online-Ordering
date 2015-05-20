﻿define(function() {
    return {
        // page "Total"
        'TOTAL_DISCOUNTS':           'Скидки', // except: Directory, Directory Mobile
        'TOTAL_SUBTOTAL':            'Подытог', // except: Directory, Directory Mobile
        'TOTAL_DELIVERY_CHARGE':     'Доставка', // except: Directory, Directory Mobile, MLB, PayPal
        'TOTAL_SHIPPING':            'Доставка', // except: Directory, Directory Mobile, MLB
        'TOTAL_DELIVERY_DISCOUNT':   'Скидка по доставке', // except: Directory, Directory Mobile, MLB, PayPal
        'TOTAL_SHIPPING_DISCOUNT':   'Скидка по доставке', // except: Directory, Directory Mobile, MLB, PayPal
        'TOTAL_SURCHARGE':           'Добавочная стоимость', // except: Directory, Directory Mobile
        'TOTAL_TAX':                 'Налог', // except: Directory, Directory Mobile
        'TOTAL_TIP':                 'Чаевые', // except: Retail, Directory, Directory Mobile, MLB
        'TOTAL_GRAND_TOTAL':         'Итого', // except: Directory, Directory Mobile, MLB, PayPal

        'DINING_OPTION_NAME': {
            'DINING_OPTION_TOGO':            'Самовывоз',
            'DINING_OPTION_EATIN':           'На месте',
            'DINING_OPTION_DELIVERY':        'Доставка',
            'DINING_OPTION_CATERING':        'Общественное питание',
            'DINING_OPTION_DRIVETHROUGH':    'За рулем',
            'DINING_OPTION_ONLINE':          'Онлайн заказ',
            'DINING_OPTION_OTHER':           'Другой',
            'DINING_OPTION_DELIVERY_SEAT':   'Доставка на место',
            'DINING_OPTION_SHIPPING':        'Сторонняя служба доставки'
        },
        'SUBCATEGORIES_VIEW_ALL':   'Показать все',
        'STORES_MI':                'mi', // ???
        'ARRAY_MONTH': [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь'
        ],
        'DAYS_OF_WEEK': {
            'monday':      'Понедельник',
            'tuesday':     'Вторник',
            'wednesday':   'Среда',
            'thursday':    'Четверг',
            'friday':      'Пятница',
            'saturday':    'Суббота',
            'sunday':      'Воскресенье'
        },
        // http://www.tetran.ru/SiteContent/Details/4
        'DAYS_OF_WEEK_SHORT': {
            'monday':      'Пнд.',
            'tuesday':     'Втр.',
            'wednesday':   'Срд.',
            'thursday':    'Чтв.',
            'friday':      'Птн.',
            'saturday':    'Сбт.',
            'sunday':      'Вск.'
        },
        'DAYS': {
            'TODAY':       'Сегодня',
            'YESTERDAY':   'Вчера',
            'TOMORROW':    'Завтра'
        },
        // ???
        'TIME_PREFIXES': {
            'FIRST_DAY_OF_MONTH':    'st',
            'SECOND_DAY_OF_MONTH':   'nd',
            'THIRD_DAY_OF_MONTH':    'rd',
            'OTHER_DAY_OF_MONTH':    'th',
            'TIME_AM':               'am',
            'TIME_PM':               'pm',
            'TIME_AT':               'at',
            'ASAP':                  'ASAP',
            'MINUTES':               'min'
        },
        'FILTERS': {
            'STORE_TYPE_RESTAURANT':   'Ресторан',
            'STORE_TYPE_RETAIL':       'Розница',
            'STORE_TYPE_OTHER':        'Другое',
            'DISTANCE_MILE':           'Миля',
            'DISTANCE_MILES':          'Miles' // ???
        },
        // https://ru.wikipedia.org/wiki/Алфавитный_список_стран_и_территорий
        'COUNTRIES': {
            'AF':   'Афганистан',
            'AX':   'Аландские острова',
            'AL':   'Албания',
            'DZ':   'Алжир',
            'AS':   'Американское Самоа',
            'AD':   'Андорра',
            'AO':   'Ангола',
            'AI':   'Ангилья',
            'AQ':   'Антарктика',
            'AG':   'Антигуа и Барбуда',
            'AR':   'Аргентина',
            'AM':   'Армения',
            'AW':   'Аруба',
            'AU':   'Австралия',
            'AT':   'Австрия',
            'AZ':   'Азербайджан',
            'BS':   'Багамские острова',
            'BH':   'Бахрейн',
            'BD':   'Бангладеш',
            'BB':   'Барбадос',
            'BY':   'Белоруссия',
            'BE':   'Бельгия',
            'BZ':   'Белиз',
            'BJ':   'Бенин',
            'BM':   'Бермудские острова',
            'BT':   'Бутан',
            'BO':   'Боливия',
            'BA':   'Босния и Герцеговина',
            'BW':   'Ботсвана',
            'BV':   'Остров Буве',
            'BR':   'Бразилия',
            'IO':   'Британская территория в Индийском океане',
            'BN':   'Бруней-Даруссалам',
            'BG':   'Болгария',
            'BF':   'Буркина-Фасо',
            'BI':   'Бурунди',
            'KH':   'Камбоджа',
            'CM':   'Камерун',
            'CA':   'Канада',
            'CV':   'Кабо-Верде',
            'KY':   'Каймановы острова',
            'CF':   'ЦАР',
            'TD':   'Чад',
            'CL':   'Чили',
            'CN':   'Китай',
            'CX':   'Остров Рождества',
            'CC':   'Кокосовые (Килинг) острова',
            'CO':   'Колумбия',
            'KM':   'Коморские острова',
            'CG':   'Конго',
            'CD':   'Конго, демократическая республика',
            'CK':   'Острова Кука',
            'CR':   'Коста-Рика',
            'CI':   'Кот-д\'Ивуар',
            'HR':   'Хорватия',
            'CU':   'Куба',
            'CY':   'Кипр',
            'CZ':   'Чешская республика',
            'DK':   'Дания',
            'DJ':   'Джибути',
            'DM':   'Доминика',
            'DO':   'Доминиканская республика',
            'EC':   'Эквадор',
            'EG':   'Египет',
            'SV':   'Сальвадор',
            'GQ':   'Экваториальная Гвинея',
            'ER':   'Эритрея',
            'EE':   'Эстония',
            'ET':   'Эфиопия',
            'FK':   'Фолклендские (Мальвинские) острова',
            'FO':   'Фарерские острова',
            'FJ':   'Фиджи',
            'FI':   'Финляндия',
            'FR':   'Франция',
            'GF':   'Французская Гвиана',
            'PF':   'Французская Полинезия',
            'TF':   'Французские Южные территории',
            'GA':   'Габон',
            'GM':   'Гамбия',
            'GE':   'Грузия',
            'DE':   'Германия',
            'GH':   'Гана',
            'GI':   'Гибралтар',
            'GR':   'Греция',
            'GL':   'Гренландия',
            'GD':   'Гренада',
            'GP':   'Гваделупа',
            'GU':   'Гуам',
            'GT':   'Гватемала',
            'GG':   'Гернси',
            'GN':   'Гвинея',
            'GW':   'Гвинея-Бисау',
            'GY':   'Гайана',
            'HT':   'Гаити',
            'HM':   'Остров Херд и острова Макдональд',
            'VA':   'Святой Престол',
            'HN':   'Гондурас',
            'HK':   'Гонконг',
            'HU':   'Венгрия',
            'IS':   'Исландия',
            'IN':   'Индия',
            'ID':   'Индонезия',
            'IR':   'Иран',
            'IQ':   'Ирак',
            'IE':   'Ирландия',
            'IM':   'Остров Мэн',
            'IL':   'Израиль',
            'IT':   'Италия',
            'JM':   'Ямайка',
            'JP':   'Япония',
            'JE':   'Джерси',
            'JO':   'Иордания',
            'KZ':   'Казахстан',
            'KE':   'Кения',
            'KI':   'Кирибати',
            'KP':   'Корейская народно-демократическая республика',
            'KR':   'Республика Корея',
            'KW':   'Кувейт',
            'KG':   'Киргизия',
            'LA':   'Лаосская народно-демократическая республика',
            'LV':   'Латвия',
            'LB':   'Ливан',
            'LS':   'Лесото',
            'LR':   'Либерия',
            'LY':   'Libyan Arab Jamahiriya', // ???
            'LI':   'Лихтенштейн',
            'LT':   'Литва',
            'LU':   'Люксембург',
            'MO':   'Макао',
            'MK':   'Македония',
            'MG':   'Мадагаскар',
            'MW':   'Малави',
            'MY':   'Малайзия',
            'MV':   'Мальдивы',
            'ML':   'Мали',
            'MT':   'Мальта',
            'MH':   'Маршалловы острова',
            'MQ':   'Мартиника',
            'MR':   'Мавритания',
            'MU':   'Маврикий',
            'YT':   'Майотта',
            'MX':   'Мексика',
            'FM':   'Микронезия',
            'MD':   'Республика Молдова',
            'MC':   'Монако',
            'MN':   'Монголия',
            'MS':   'Монтсеррат',
            'MA':   'Марокко',
            'MZ':   'Мозамбик',
            'MM':   'Мьянма',
            'NA':   'Намибия',
            'NR':   'Науру',
            'NP':   'Непал',
            'NL':   'Нидерланды',
            'AN':   'Саба',
            'NC':   'Новая Каледония',
            'NZ':   'Новая Зеландия',
            'NI':   'Никарагуа',
            'NE':   'Нигер',
            'NG':   'Нигерия',
            'NU':   'Ниуэ',
            'NF':   'Остров Норфолк',
            'MP':   'Северные Марианские острова',
            'NO':   'Норвегия',
            'OM':   'Оман',
            'PK':   'Пакистан',
            'PW':   'Палау',
            'PS':   'Государство Палестина',
            'PA':   'Панама',
            'PG':   'Папуа - Новая Гвинея',
            'PY':   'Парагвай',
            'PE':   'Перу',
            'PH':   'Филиппины',
            'PN':   'Питкэрн острова',
            'PL':   'Польша',
            'PT':   'Португалия',
            'PR':   'Пуэрто-Рико',
            'QA':   'Катар',
            'RE':   'Реюньон',
            'RO':   'Румыния',
            'RU':   'Российская Федерация',
            'RW':   'Руанда',
            'SH':   'Острова Святой Елены',
            'KN':   'Сент-Китс и Невис',
            'LC':   'Сент-Люсия',
            'PM':   'Сен-Пьер и Микелон',
            'VC':   'Сент-Винсент и Гренадины',
            'WS':   'Самоа',
            'SM':   'Сан-Марино',
            'ST':   'Сан-Томе и Принсипи',
            'SA':   'Саудовская Аравия',
            'SN':   'Сенегал',
            'CS':   'Сербия и Черногория',
            'SC':   'Сейшельские острова',
            'SL':   'Сьерра-Леоне',
            'SG':   'Сингапур',
            'SK':   'Словакия',
            'SI':   'Словения',
            'SB':   'Соломоновы острова',
            'SO':   'Сомали',
            'ZA':   'Южно-Африканская республика',
            'GS':   'Южная Георгия и Южные Сандвичевы острова',
            'ES':   'Испания',
            'LK':   'Шри-Ланка',
            'SD':   'Судан',
            'SR':   'Суринам',
            'SJ':   'Шпицберген и Ян-Майен',
            'SZ':   'Свазиленд',
            'SE':   'Швеция',
            'CH':   'Швейцария',
            'SY':   'Сирийская Арабская республика',
            'TW':   'Тайвань, провинция Китая',
            'TJ':   'Таджикистан',
            'TZ':   'Танзания',
            'TH':   'Таиланд',
            'TL':   'Восточный Тимор',
            'TG':   'Того',
            'TK':   'Токелау',
            'TO':   'Тонга',
            'TT':   'Тринидад и Тобаго',
            'TN':   'Тунис',
            'TR':   'Турция',
            'TM':   'Туркмения ',
            'TC':   'Теркс и Кайкос',
            'TV':   'Тувалу',
            'UG':   'Уганда',
            'UA':   'Украина',
            'AE':   'Объединенные Арабские Эмираты',
            'GB':   'Великобритания',
            'US':   'Соединённые Штаты Америки',
            'UM':   'Внешние малые острова США',
            'UY':   'Уругвай',
            'UZ':   'Узбекистан',
            'VU':   'Вануату',
            'VE':   'Венесуэла',
            'VN':   'Вьетнам',
            'VG':   'Виргинские острова (Великобритания) ',
            'VI':   'Виргинские острова (США)',
            'WF':   'Уоллис и Футуна',
            'EH':   'Западная Сахара',
            'YE':   'Йемен',
            'ZM':   'Замбия',
            'ZW':   'Зимбабве'
        },
        // https://ru.wikipedia.org/wiki/Категория:Штаты_США
        'STATES': {
            'AL':   'Алабама',
            'AK':   'Аляска',
            'AZ':   'Аризона',
            'AR':   'Арканзас',
            'CA':   'Калифорния',
            'CO':   'Колорадо',
            'CT':   'Коннектикут',
            'DE':   'Делавэр',
            'FL':   'Флорида',
            'GA':   'Джорджия‎',
            'HI':   'Гавайи',
            'ID':   'Айдахо‎',
            'IL':   'Иллинойс',
            'IN':   'Индиана',
            'IA':   'Айова',
            'KS':   'Канзас',
            'KY':   'Кентукки',
            'LA':   'Луизиана',
            'ME':   'Мэн',
            'MD':   'Мэриленд',
            'MA':   'Массачусетс',
            'MI':   'Мичиган',
            'MN':   'Миннесота',
            'MS':   'Миссисипи',
            'MO':   'Миссури',
            'MT':   'Монтана',
            'NE':   'Небраска',
            'NV':   'Невада',
            'NH':   'Нью-Гэмпшир',
            'NJ':   'Нью-Джерси‎',
            'NM':   'Нью-Мексико',
            'NY':   'Нью-Йорк',
            'NC':   'Северная Каролина',
            'ND':   'Северная Дакота',
            'OH':   'Огайо',
            'OK':   'Оклахома',
            'OR':   'Орегон',
            'PA':   'Пенсильвания',
            'RI':   'Род-Айленд',
            'SC':   'Южная Каролина',
            'SD':   'Южная Дакота',
            'TN':   'Теннесси',
            'TX':   'Техас',
            'UT':   'Юта',
            'VT':   'Вермонт',
            'VA':   'Виргиния',
            'WA':   'Вашингтон',
            'WV':   'Западная Виргиния',
            'WI':   'Висконсин',
            'WY':   'Вайоминг'
        },
        'ERRORS': {
            'STORE_IS_CLOSED':             'Error: Store is closed',
            'BLOCK_STORE_IS_CLOSED':       'We\'re sorry, your order cannot be processed because the store is closed',
            'FORCED_MODIFIER':             'Please select at least | %d modifier(s) in %s',
            'SELECT_SIZE_MODIFIER':        'Select a size please',
            'SELECT_PRODUCT_ATTRIBUTES':   'Please select all attributes',
            'BLOCK_WEIGHT_IS_NOT_VALID':   'The product weight is not set or zero',
            'MAINTENANCE_CONFIGURATION':   'Can\'t get application configuration. Please check backend settings.',
            'MAINTENANCE_PAYMENT':         'Please setup at least one payment option',
            'MAINTENANCE_DINING':          'Please setup at least one dining option',
            'MAINTENANCE_ORDER_TYPE':      'Please setup at least one order type (in-store pickup or shipping)',
            'RESOURCES_CSS':               'Unable to load CSS resources. Now the page is reloaded.',
            'RESOURCES_TEMPLATES':         'Unable to load template resources. Now the page is reloaded.'
        },
        'MSG': {
            'ERROR_STORE_IS_CLOSED':                          'We\'re sorry, your order cannot be processed because the store is closed for selected pickup day/time',
            'ERROR_GEOLOCATION': [
                'There was an error while retrieving your location.',
                'Your current location retrieval is disallowed. Reset location settings if you want to allow it.',
                'The browser was unable to determine your location.',
                'The browser timed out while retrieving your location.'
            ],
            'ERROR_GEOLOCATION_NOAPI':                        'Geolocation API is not supported in your browser.',
            'ERROR_SUBMIT_ORDER':                             'Failed to submit an order. Please try again.',
            'ERROR_ORDERS_PICKUPTIME_LIMIT':                  'Maximum number of orders for this pickup time exceeded. Please select different pickup time.',
            'ERROR_INSUFFICIENT_STOCK':                       'Some products have insufficient stock.',
            'ERROR_OCCURRED':                                 'Error occurred:',
            'ERROR_HAS_OCCURRED':                             'The error has occurred',
            'ERROR_HAS_OCCURRED_WITH_CONTACT':                'The error has occurred, please contact: %email: %%phone: %',
            'ERROR_MIN_ITEMS_LIMIT':                          'Please select at least %s items to place an order.',
            'ERROR_INCORRECT_AJAX_DATA':                      'Incorrect data in server response.',
            'ERROR_SERVER_UNREACHED':                         'The server cannot be reached at this time.',
            'ERROR_DELIVERY_ADDRESS_INPUT':                   'The following necessary fields are blank: %s',
            'ERROR_DELIVERY_EXCEEDED':                        'Exceeded maximum delivery distance',
            'ERROR_DELIVERY_ADDRESS':                         'Couldn\'t verify delivery address',
            'ERROR_CATEGORY_LOAD':                            'Unable to get the menu from backend. Now the page is reloaded',
            'ERROR_MODIFIERS_LOAD':                           'Unable to get the list modifiers of product from backend. Now the page is reloaded.',
            'ERROR_RECENT_LOAD':                              'Unable to get a list of recent orders.',
            'ERROR_PRODUCTS_LOAD':                            'Unable to get the list products of menu from backend. Now the page is reloaded.',
            'ERROR_STORES_LOAD':                              'Unable to get the list of stores.',
            'DELIVERY_ITEM':                                  'Delivery Charge',
            'BAG_CHARGE_ITEM':                                'Bag Charge',
            'REPEAT_ORDER_NOTIFICATION':                      'Some items have changed or no longer available. Please review items before placing your order.',
            'REWARD_CARD_UNDEFINED':                          'Invalid Reward Card Number.',
            'ADD_MORE_FOR_DELIVERY':                          'Please add %s more for delivery',
            'ADD_MORE_FOR_SHIPPING':                          'Please add %s more for shipping',
            'ERROR_PRODUCT_NOT_SELECTED':                     'You have not selected any product',
            'ERROR_EMPTY_NOT_VALID_DATA':                     'Following required fields are blank or contain incorrect data: %s',
            'ERROR_GRATUITY_EXCEEDS':                         'Gratuity amount can\'t exceed the receipt amount',
            'ERROR_CARD_EXP':                                 'Exp. Date less then current date',
            'ERROR_FORCED_MODIFIER':                          'This modifier is required',
            'ERROR_CHROME_CRASH':                             'This version of Chrome is unstable and unsupported. Please update to the latest version or use different browser.',
            'ERROR_UNSUPPORTED_BROWSER':                      'The current browser version is not supported. Please update it to the latest release.',
            'PAY_AT_STORE':                                   'Pay at Store',
            'PAY_AT_DELIVERY':                                'Pay at Delivery',
            'ERROR_GET_CHILD_PRODUCTS':                       'Unable to get the information about the product from backend. Now the page is reloaded.',
            'ERROR_SHIPPING_SERVICES_NOT_FOUND':              'No shipping services found',
            'SHIPPING_SERVICES_RETRIVE_IN_PROGRESS':          'Retrieving shipping services...',
            'SHIPPING_SERVICES_SET_ADDRESS':                  'Fill required address fields above',
            'PRODUCTS_EMPTY_RESULT':                          'No products found',
            'FILTER_SHOW_ALL':                                'Show All',
            'FREE_MODIFIERS_PRICE':                           'Modifiers for up to %s will be free',
            'FREE_MODIFIERS_QUANTITY':                        'First %s modifiers selected will be free',
            'FREE_MODIFIERS_QUANTITY1':                       'First modifier selected will be free',
            'PRODUCTS_VALID_TIME':                            'Available: ',
            'ERROR_REVEL_EMPTY_NEW_PASSWORD':                 'Please enter new password.',
            'ERROR_REVEL_EMPTY_OLD_PASSWORD':                 'Please enter old password.',
            'ERROR_REVEL_NOT_MATCH_PASSWORDS':                'New Password & Repeat Password values don\'t match',
            'ERROR_REVEL_USER_EXISTS':                        'User %s already exists.',
            'ERROR_REVEL_UNABLE_TO_PERFORM':                  'Unable to perform action. Please ask about this problem at ask.revelsystems.com.',
            'ERROR_REVEL_ATTEMPTS_EXCEEDED':                  'Max number of authentication attempts exceeded. Account deleted.',
            'ERROR_REVEL_PASSWORD_UPDATE_FAILED':             'Password update failed. Old password is invalid.',
            'ERROR_REVEL_AUTHENTICATION_FAILED':              'Authentication failed. Please enter valid email & password.',
            'ERROR_NO_MSG_FROM_SERVER':                       'No message about the error',
            'ERROR_GET_DISCOUNTS':                            'Failed request to get discounts',
            'ERROR_INCORRECT_DISCOUNT_CODE':                  'Type correct discount code from 4 to 16 characters',
            'DISCOUNT_CODE_NOT_FOUND':                        'The typed discount code hasn\'t been found. Automatic discounts can be applied only.',
            'DISCOUNT_CODE_NOT_APPLICABLE':                   'The typed discount code is not applicable now. Automatic discounts can be applied only.',
            'ESTABLISHMENTS_ERROR_NOSTORE':                   'No store is available for the specified brand',
            'ESTABLISHMENTS_CHOOSE_BRAND_DESKTOP':            'Choose which %s you are looking for:',
            'ESTABLISHMENTS_CHOOSE_BRAND_MOBILE':             'Choose which %s you\'re looking for:',
            'ESTABLISHMENTS_PROCEED_BUTTON':                  'Proceed',
            'ESTABLISHMENTS_BACK_BUTTON':                     'Go Back',
            'ESTABLISHMENTS_ALERT_MESSAGE_DESKTOP':           'If you choose a different store location, your order will be canceled. Cancel Order?',
            'ESTABLISHMENTS_ALERT_MESSAGE_TITLE_MOBILE':      'Warning',
            'ESTABLISHMENTS_ALERT_MESSAGE_MOBILE':            'If you switch stores, your order will be discarded.',
            'ESTABLISHMENTS_ALERT_MESSAGE_QUESTION_MOBILE':   'Continue?',
            'ESTABLISHMENTS_ALERT_PROCEED_BUTTON_DESKTOP':    'Proceed',
            'ESTABLISHMENTS_ALERT_PROCEED_BUTTON_MOBILE':     'Ok',
            'ESTABLISHMENTS_ALERT_BACK_BUTTON_DESKTOP':       'Go Back',
            'ESTABLISHMENTS_ALERT_BACK_BUTTON_MOBILE':        'Back',
            'HALF_PRICE_STR': [
                'Full',
                'First Half',
                'Second Half'
            ],
            'REVEL_DIRECTORY_WELCOME_TEXT':                   'and easily pay at any establishment that uses Revel',
            'BRAND_DIRECTORY_WELCOME_TEXT':                   'to easy pay',
            'ERROR_INTEGRITY_TEST_MAIN':                      'There is no testA_xx function in main.js (functions.js). Try manually clear the browser cache and restart.',
            'MODIFIER_FREE':                                  'free',
            'ERROR_PAYPAL_DIRECTIONS_NO_RESULT':              'Unable to get directions'
        }
    } // end of locale
}); // end of module