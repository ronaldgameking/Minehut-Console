/* global pys_fb_pixel_options, pys_fb_pixel_regular_events, pys_fb_pixel_dynamic_triggers, pys_fb_pixel_dynamic_events, pys_fb_pixel_custom_code_events */
jQuery(document).ready(function ($) {

    if (typeof pys_fb_pixel_options === 'undefined') {
        return;
    }

    var options = pys_fb_pixel_options;
    var utm_terms = ['utm_source', 'utm_media', 'utm_campaign', 'utm_term', 'utm_content'];
    var scroll_pos_thresholds = {};

    // Load FB pixel
    !function (f, b, e, v, n, t, s) {
        if (f.fbq)return;
        n = f.fbq = function () {
            n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq)f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.agent = 'dvpixelyoursite';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
    }(window,
        document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');


    var clone = function (src, dest) {
        for (var key in src) {
            dest[key] = src[key];
        }
        return dest;
    };

    /**
     * Setup Events Handlers
     */
    !function setupEventHandlers(){

        /**
         * WooCommerce Events
         */
        if (options.hasOwnProperty('woo')) {

            // WooCommerce Single Product AJAX AddToCart handler
            if ( options.woo.is_product && options.woo.add_to_cart_btn_enabled ) {

                $(document).on('added_to_cart', function () {

                    var params = {};

                    if (options.woo.single_product.type === 'variable') {

                        var $form = $('form.variations_form.cart'),
                            variation_id = false,
                            qty;

                        if ($form.length === 1) {
                            variation_id = $form.find('input[name="variation_id"]').val();
                        }

                        if (false === variation_id || false === options.woo.single_product.add_to_cart_params.hasOwnProperty(variation_id)) {
                            console.error('PYS PRO: product variation ID not found in available product variants.');
                            return;
                        }

                        params = clone(options.woo.single_product.add_to_cart_params[variation_id], {});
                        qty = parseInt($form.find('input[name="quantity"]').val());
                        params.value = params.value * qty;
                        
                    } else {
                        params = clone(options.woo.single_product.add_to_cart_params, {});
                    }

                    var event = {
                        type: 'track',
                        name: 'AddToCart',
                        params: params
                    };

                    event = addTrafficSourceParams(event);
                    fbq(event.type, event.name, event.params);

                });

            }

            // WooCommerce Shop and Product Category AJAX AddToCart handler
            if ( ( options.woo.is_shop || options.woo.is_cat ) && options.woo.add_to_cart_btn_enabled ) {

                $(document).on('adding_to_cart', function ( e, $button, data ) {

                    data.action = 'pys_fb_ajax';
                    data.sub_action = 'get_woo_product_addtocart_params';

                    $.get( options.ajax_url, data, function( response ) {

                        if ( ! response ) {
                            return;
                        }

                        if ( response.error ) {
                            return;
                        }

                        var event = {
                            type: 'track',
                            name: 'AddToCart',
                            params: response.data
                        };

                        event = addTrafficSourceParams(event);
                        fbq(event.type, event.name, event.params);

                    });

                });

            }

        }

    }();

    manageCookies();
    regularEvents();
    regularCustomCodeEvents();
    dynamicEvents();
    
    // WooCommerce Affiliate and ajax-ed AddToCart Events
    if(typeof pys_fb_pixel_ajax_events !== 'undefined') {

        $(".product_type_external").click(function () {

            var event_ids = $(this).attr('data-pys-ajax-event-id');

            if(typeof event_ids !== 'undefined') {
                event_ids.split(',').forEach(function (event_id) {
                    if (pys_fb_pixel_ajax_events.hasOwnProperty(event_id)) {
                        evaluateDynamicEventByID(pys_fb_pixel_ajax_events[event_id]);
                    }
                });
            }

        });

    }

    // WooCommerce PayPal Event
    $(document).on('submit click', '#place_order', function () {

        var method = $('input[name="payment_method"]:checked').val();

        if (method === false || method !== 'paypal') {
            return;
        }

        try {

            if (typeof pys_fb_pixel_woo_paypal_event_id === 'undefined' || typeof pys_fb_pixel_ajax_events === 'undefined') {
                return;
            }

            if (pys_fb_pixel_ajax_events.hasOwnProperty(pys_fb_pixel_woo_paypal_event_id)) {
                evaluateDynamicEventByID(pys_fb_pixel_ajax_events[pys_fb_pixel_woo_paypal_event_id]);
            }

        } catch (e) {
            console.log(e);
        }

    });

    // EDD AddToCart
    $('.edd-add-to-cart').click(function () {

        try {

            // extract pixel event ids from classes like 'pys-event-id-{UNIQUE ID}'
            var classes = $.grep(this.className.split(" "), function (element, index) {
                return element.indexOf('pys-fb-event-id-') === 0;
            });

            // verify that we have at least one matching class
            if (typeof classes === 'undefined' || classes.length === 0) {
                return;
            }

            // extract event id from class name
            var regexp = /pys-fb-event-id-(.*)/;
            var event_id = regexp.exec(classes[0]);

            if (event_id === null) {
                return;
            }

            event_id = event_id[1];

            if (pys_fb_pixel_ajax_events.hasOwnProperty(event_id)) {
                evaluateDynamicEventByID(pys_fb_pixel_ajax_events[event_id]);
            }

        } catch (e) {
            console.log(e);
        }

    });

    /**
     * Process Init, PageView, General, Search, WooCommerce (except ajax-ed AddToCart),
     * and Custom On Page events. In case if delay param is present - event will be fired after desired timeout.
     */
    function regularEvents() {

        try {
            
            if (typeof pys_fb_pixel_regular_events === 'undefined') {
                return;
            }

            for (var i = 0; i < pys_fb_pixel_regular_events.length; i++) {

                var event = pys_fb_pixel_regular_events[i];

                // optionally, add traffic source params
                event = addTrafficSourceParams(event);

                if (event.hasOwnProperty('delay') === false || event.delay === 0) {
                    fbq(event.type, event.name, event.params);
                } else {

                    setTimeout(function (type, name, params) {
                        fbq(type, name, params);
                    }, event.delay * 1000, event.type, event.name, event.params);

                }

            }

        } catch (e){
            console.error(e);
        }

    }

    /**
     * Process only custom code regular events.
     */
    function regularCustomCodeEvents() {

        if (typeof pys_fb_pixel_custom_code_events === 'undefined') {
            return;
        }

        $.each(pys_fb_pixel_custom_code_events, function (index, code) {
            eval(code);
        });

    }

    function dynamicEvents() {

        if (typeof pys_fb_pixel_dynamic_triggers === 'undefined' || typeof pys_fb_pixel_dynamic_events === 'undefined') {
            return;
        }

        // setup listeners for css click, css mouse over triggers
        // setup scroll pos thresholds
        $.each(pys_fb_pixel_dynamic_triggers, function (index, trigger) {

            switch (trigger.trigger_type ) {
                case 'css_click':
                    attachCssClickHandler(trigger);
                    break;

                case 'css_mouseover':
                    attachMouseOverHandler(trigger);
                    break;

                case 'scroll_pos':
                    setupScrollPosThresholds(trigger);
                    break;

                default:
                    break;
            }

        });

        // setup url click handlers
        $('[data-pys-event-id]').onFirst('click', function () {

            // Non-default binding used to avoid situations when some code in external js
            // stopping events propagation, eg. returns false, and our handler will never called.

            $(this).attr('data-pys-event-id').split(',').forEach(function (item) {

                var event_id = parseInt(item);

                if (isNaN(event_id) === false) {
                    if (pys_fb_pixel_dynamic_events.hasOwnProperty(event_id)) {
                        evaluateDynamicEventByID(pys_fb_pixel_dynamic_events[event_id]);
                    }
                }

            });

        });

        // manage on scroll triggers
        $(document).scroll(function () {

            var scroll_pos = $(window).scrollTop();

            $.each(scroll_pos_thresholds, function (scroll_threshold, events_ids) {

                scroll_threshold = parseInt(scroll_threshold.substring(1)); // integer threshold value

                // position is not reached
                if (scroll_pos <= scroll_threshold) {
                    return true;
                }

                // fire events for current threshold
                $.map(events_ids, function (event_id, index) {

                    // fire event only once for current scroll pos
                    scroll_pos_thresholds['_' + scroll_threshold][index] = null;

                    if (pys_fb_pixel_dynamic_events.hasOwnProperty(event_id)) {
                        evaluateDynamicEventByID(pys_fb_pixel_dynamic_events[event_id]);
                    }

                });

            });

        });

    }

    function setupScrollPosThresholds(trigger) {

        var height = $(document).height() - $(window).height();

        // convert % to pixels
        var scroll_pos = parseInt(trigger.trigger_value);
        scroll_pos = height * scroll_pos / 100;
        scroll_pos = Math.round(scroll_pos);

        scroll_pos = '_' + scroll_pos;

        // add new position
        if (typeof scroll_pos_thresholds[scroll_pos] === 'undefined') {
            scroll_pos_thresholds[scroll_pos] = [];
        }

        // array is used because many events can be attached to same scroll position
        // so each position has an array with events ids
        scroll_pos_thresholds[scroll_pos].push(trigger.event_id);

    }

    function attachCssClickHandler(trigger) {

        // Non-default binding used to avoid situations when some code in external js
        // stopping events propagation, eg. returns false, and our handler will never called
        $(document).onFirst('click', trigger.trigger_value, function () {

            if (pys_fb_pixel_dynamic_events.hasOwnProperty(trigger.event_id)) {
                evaluateDynamicEventByID(pys_fb_pixel_dynamic_events[trigger.event_id]);
            }

        });

    }

    function attachMouseOverHandler(trigger) {

        // Non-default binding used to avoid situations when some code in external js
        // stopping events propagation, eg. returns false, and our handler will never called
        $(trigger.trigger_value).onFirst('mouseover', function () {

            // event should be fired only once
            if( $(this).hasClass('pys-mouse-over-' + trigger.event_id) ) {
                return;
            }

            $(this).addClass('pys-mouse-over-' + trigger.event_id);

            if (pys_fb_pixel_dynamic_events.hasOwnProperty(trigger.event_id)) {
                evaluateDynamicEventByID(pys_fb_pixel_dynamic_events[trigger.event_id]);
            }

        });

    }

    function evaluateDynamicEventByID(event) {

        if (event.hasOwnProperty('custom_code')) {
            eval(event.custom_code);
        } else {

            event = addTrafficSourceParams(event);
            fbq(event.type, event.name, event.params);

        }
    
    }

    function getTrafficSource() {

        try {

            var referrer = document.referrer.toString();

            var direct = referrer.length === 0;
            //noinspection JSUnresolvedVariable
            var internal = direct ? false : referrer.indexOf(pys_fb_pixel_options.site_url) === 0;
            var external = !(direct || internal);
            var cookie = typeof Cookies.get('pys_fb_pixel_traffic_source') === 'undefined' ? false : Cookies.get('pys_fb_pixel_traffic_source');

            if (external === false) {
                return cookie ? cookie : 'direct';
            } else {
                return cookie && cookie === referrer ? cookie : referrer;
            }

        } catch (e) {

            console.log(e);
            return '';

        }

    }

    /**
     * Return UTM terms from request query variables or from cookies.
     */
    function getUTMs() {

        try {

            var terms = {};
            var queryVars = getQueryVars();

            $.each(utm_terms, function (index, name) {

                if (Cookies.get('pys_fb_pixel_' + name)) {
                    terms[name] = Cookies.get('pys_fb_pixel_' + name);
                } else if (queryVars.hasOwnProperty(name)) {
                    terms[name] = queryVars[name];
                }

            });

            return terms;

        } catch (e) {
            console.log(e);
            return {};
        }

    }

    function manageCookies() {

        try {

            var source = getTrafficSource();

            if (source !== 'direct') {
                Cookies.set('pys_fb_pixel_traffic_source', source);
            } else {
                Cookies.remove('pys_fb_pixel_traffic_source');
            }

            var queryVars = getQueryVars();

            $.each(utm_terms, function (index, name) {

                if (Cookies.get('pys_fb_pixel_' + name) === undefined && queryVars.hasOwnProperty(name)) {
                    Cookies.set('pys_fb_pixel_' + name, queryVars[name]);
                }

            });

        } catch (e) {
            console.log(e);
        }

    }

    /**
     * Add `traffic_source` and `utm` params to event params for any event except `init`.
     */
    function addTrafficSourceParams(event) {

        try {

            //noinspection JSUnresolvedVariable
            if (pys_fb_pixel_options.track_traffic_source === false || event.type === 'init') {
                return event;
            }

            event.params.traffic_source = getTrafficSource();

            $.each(getUTMs(), function (name, value) {

                if ($.inArray(name, utm_terms) >= 0) {
                    event.params[name] = value;
                }

            });

            return event;

        } catch (e) {

            console.log(e);
            return event;

        }

    }

    /**
     * Return query variables object with where property name is query variable and property value is query variable value.
     */
    function getQueryVars() {

        try {

            var result = {}, tmp = [];

            window.location.search
                .substr(1)
                .split("&")
                .forEach(function (item) {

                    tmp = item.split('=');

                    if (tmp.length > 1) {
                        result[tmp[0]] = tmp[1];
                    }

                });

            return result;

        } catch (e) {
            console.log(e);
            return {};
        }

    }

    if(pys_fb_pixel_options.click_event_enabled) {

        /**
         * ClickEvent listener.
         *
         * @since 6.2.1
         */
        $(document).onFirst('click', 'a, button, input[type="button"], input[type="submit"]', function () {

            //@fixme: on WC single product page Woo trigger click event to initialize tabs
            //@see: single-product.js:23

            var params = {};

            for (var key in pys_fb_pixel_options.content_params) {
                params[key] = pys_fb_pixel_options.content_params[key];
            }

            var elem = $(this),
                event = {
                    type: 'trackCustom',
                    name: 'ClickEvent',
                    params: params
                };

            if (elem.is('a')) {
                event.params.tag_type = 'a';
                event.params.tag_text = elem.text();
            } else if (elem.is('button')) {
                event.params.tag_type = 'button';
                event.params.tag_text = elem.text();
            } else if (elem.is('input[type="button"]')) {
                event.params.tag_type = 'input.button';
                event.params.tag_text = elem.val();
            } else {
                event.params.tag_type = 'input.submit';
                event.params.tag_text = elem.val();
            }

            event = addTrafficSourceParams(event);
            fbq(event.type, event.name, event.params);

        });
    }

    window.pys_fb_event = function (params, name) {

        for (var key in pys_fb_pixel_options.content_params) {
            params[key] = pys_fb_pixel_options.content_params[key];
        }

        var event = {
            type: 'trackCustom',
            name: name,
            params: params
        };

        event = addTrafficSourceParams(event);
        fbq(event.type, event.name, event.params);

    };

});