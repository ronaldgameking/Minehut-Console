(function($){

  $(document).ready(function(){
    var champsTestimonials = $('.testimonial-slide-content');

    champsTestimonials.flickity({
      // options
      cellAlign: 'center',
      wrapAround: true,
      prevNextButtons: false,
      autoPlay: 5000,
      pauseAutoPlayOnHover: false,
      imagesLoaded: true,
      pageDots: false
    });


  });//doc ready


})(jQuery);
