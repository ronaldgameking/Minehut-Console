//@see: https://www.bennadel.com/blog/1752-tracking-google-adsense-clicks-with-jquery-and-coldfusion.htm
(function (document, window, $) {

    var isOverGoogleAd = false;

    $(document)
        .on('mouseover', 'ins > ins > iframe', function () {
            isOverGoogleAd = true;
        })
        .on('mouseout', 'iframe', function () {
            isOverGoogleAd = false;
        });

    $(window)
        .blur( function () {
            if (isOverGoogleAd) {
                $(document).trigger('pys_adsense_click', {});
            }
        })
        .focus();

    // Adsense Event
    if (pys_fb_pixel_options.adsense_enabled) {

        $(document).on('pys_adsense_click', function (e, data) {
            pys_fb_event(data, 'AdSense');
        });

    }

})(document, window, jQuery);