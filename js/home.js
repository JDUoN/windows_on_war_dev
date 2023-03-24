(function($) {
	$.fn.equalHeights = function(px) {
		if (Modernizr.mq('screen and (min-width:768px)')) {
			$(this).each(function(){
				var currentTallest = 0;
				$('> div div:first-child', this).each(function(i){
					if ($(this).height() > currentTallest) { currentTallest = $(this).height(); }
				});

				$('> div div:first-child', this).css({'min-height': currentTallest});
			});
		}

		return this;
	};

	// use this instead of $(document).ready() to ensure that images are loaded when
	// we try to calculate the heights.
	$(window).load(function() {
		$('.panel div.row-fluid').equalHeights();
	});

	$(document).ready(function() {
		$("div.cynthia a.fancybox").fancybox({
			width: 456,
			height: 292
		});
	});
})(jQuery);