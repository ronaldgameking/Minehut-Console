(function($){

  $(document).ready(function(){

    //hero slides
    var heroSlides = $('.slg-slides');
    var slgGamePrevBtn = $('.slg-games-slideshow .prev-slide');
    var slgGameNextBtn = $('.slg-games-slideshow .next-slide');
    var heroSpeed = parseInt(heroSlides.attr('data-slide-duration'));

    heroSlides.flickity({
      // options
      cellAlign: 'left',
      wrapAround: true,
      prevNextButtons: false,
      autoPlay: heroSpeed*1000,
      pauseAutoPlayOnHover: false,
      wrapAround: true
    });

    slgGamePrevBtn.on( 'click', function() {
      heroSlides.flickity('previous');
      heroSlides.flickity('stopPlayer');
    });
    slgGameNextBtn.on( 'click', function() {
      heroSlides.flickity('next');
      heroSlides.flickity('stopPlayer');
    });

    function getUrlVars(url) {
      var vars = {};
      var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
      });
      return vars;
    }

    var slideVideos = $('.slide-video');

    slideVideos.each(function(){

      var videoUrl = $(this).attr('data-video-url');
      var videoId = getUrlVars(videoUrl)['v'];
      var startTimeParam = getUrlVars(videoUrl)['t'];
      var startTime = startTimeParam !== undefined ? startTimeParam : 0;

      $(this).YTPlayer({
          fitToBackground: true,
          videoId: videoId,
          playerVars: {
            modestbranding: 0,
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            branding: 0,
            rel: 0,
            autohide: 0,
            start: startTime
          }
      });

    });

    $('[data-fancybox="gallery"]').fancybox({

    });

    // var downPlpDownArrow = document.querySelector('.plp-down-arrow a');

    // if ( downPlpDownArrow ) {
    //   downPlpDownArrow.addEventListener('click', function(e){
    //     e.preventDefault();
    //     document.querySelector('.plp-down-arrow').scrollIntoView({
    //       behavior: 'smooth',
    //       block:'start'
    //     });
    //   });
    // }  // Product may decide to re-enable this in the future

  });//doc ready

  $(window).ready(function(){
    setTimeout(function(){
      $('.post-slides .flickity-viewport .carousel-cell, .post-slides .flickity-viewport .post-item').css("height","100%");
    },500);
  });

})(jQuery);
