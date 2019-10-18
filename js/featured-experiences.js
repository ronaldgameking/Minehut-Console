document.addEventListener('DOMContentLoaded', function() {

  // instantiate flickity carousel for module-featured-experiences

  const mobileBreakpoint = 669;
  const featuredExperiencesCarousel = document.querySelector('.featured-experiences .carousel');
  const cellCount = document.querySelectorAll('.featured-experiences .carousel-cell').length;

  var flktyFeaturedExperiences = new Flickity( featuredExperiencesCarousel, {
    "wrapAround": cellCount > 2,
    "groupCells": cellCount < 2,
    "pauseAutoPlayOnHover": false,
    "prevNextButtons": false,
    "lazyLoad": 2,
    "autoPlay": featuredExperiencesCarousel.dataset.autoplay * 1000
  });

  featuredExperiencesCarousel.style.opacity = 1;
  const flktyFeaturedExperiencesCurrent = Flickity.data( featuredExperiencesCarousel );

  // hide featuredExperiencesCarousel dots if only 1 slide

  var isSingleSlide = cellCount < 2;
  featuredExperiencesCarousel.classList.toggle( 'is-single-slide', isSingleSlide );

  // turn on/off autoplay

  const togglePlayer = () => {
    if (featuredExperiencesCarousel.dataset.autoplay && (window.clientWidth >= mobileBreakpoint || document.documentElement.clientWidth >= mobileBreakpoint)) { // exclude scrollbar in width measurement
      flktyFeaturedExperiences.playPlayer();
    } else {
      flktyFeaturedExperiences.stopPlayer();
    }
  }

  // turn on/off ability to drag, scroll, or swipe featuredExperiencesCarousel

  const toggleScroll = () => {
    if (window.clientWidth >= mobileBreakpoint || document.documentElement.clientWidth >= mobileBreakpoint) {
      flktyFeaturedExperiences.options.draggable = true;
    } else {
      flktyFeaturedExperiences.options.draggable = false;
    }
    flktyFeaturedExperiences.updateDraggable();
  }

  // set selected slide for mobile 

  const mobileSlide = () => {
    if (window.clientWidth <= mobileBreakpoint || document.documentElement.clientWidth <= mobileBreakpoint) {
      flktyFeaturedExperiences.selectCell( 0, false, true );
    }
  }

  // modify DOM content

    togglePlayer();
    toggleScroll();
    mobileSlide();
    trunk.truncate('.featured-experiences .copy p:first-child');
    trunk.truncate('.featured-experiences .copy p:last-child');
    trunk.truncate('.featured-experiences .carousel-cell>div:not(:first-child)>div .copy p:last-child');
    trunk.truncate('.featured-experiences .carousel-cell>div:not(:first-child)>div .copy p:first-child');

    window.addEventListener('resize', event => {
      flktyFeaturedExperiencesCurrent.resize();
      togglePlayer();
      toggleScroll();
      mobileSlide();
      trunk.truncate('.featured-experiences .copy p:first-child');
      trunk.truncate('.featured-experiences .copy p:last-child');
      trunk.truncate('.featured-experiences .carousel-cell>div:not(:first-child)>div .copy p:last-child');
      trunk.truncate('.featured-experiences .carousel-cell>div:not(:first-child)>div .copy p:first-child');
    });

});