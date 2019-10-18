document.addEventListener('DOMContentLoaded', function() {
	trunk.truncate('.video-module-container .video-grid .video-element p.title');

	window.addEventListener('resize', function() {
		trunk.truncateOnResize('.video-module-container .video-grid .video-element p.title');
	});
});

(function($){
  $(".video-module-container").fitVids({ 
      customSelector: "iframe[src^='https://player.twitch.tv']"
  });
})(jQuery);