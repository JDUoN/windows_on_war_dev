(function($) {
	/**
	 *
	 * History manipulate and theme navigation
	 *
	 **/

	var historyManager = (function() {
		var historyStack,
			isShouldRecord;

		var shouldRecord = function(record) {
			isShouldRecord = record;
		};

		var init = function() {
			historyStack = Array();
			isShouldRecord = true;

			if (Modernizr.hashchange) {
				$(window).bind('hashchange', function() {
					var hash = document.URL.substr(document.URL.indexOf('#') + 1)

					shouldRecord(false);
					$('#image-scroller').smoothDivScroll('scrollToElement', 'id', '_' + hash);
				});
			}

			$('body').bind('hzscroll.activate', function(event){
				var section = $(event.target).children('a').attr('href');

				if (typeof section !== "undefined") {
					section = section.substring(section.indexOf("#") + 2);
					addToHistory(section);

					if (isShouldRecord)
						recordHistory();
				}
			});
		};

		var isHistoryEnabled = function() {
			return Modernizr.history;
		};

		var addToHistory = function(title) {
			console.log('Added ' + title);
			historyStack.push(title);
		};

		var recordHistory = function() {
			var item = historyStack.pop();
			if (typeof item === "undefined")
				return;

			var data = {"section": item},
				url = "#" + item;

			console.log(data, item, url);
			if(isHistoryEnabled())
			{
				history.pushState(data, item, url);

				$('body').trigger('wow.themechange', data);
			}

			historyStack = Array();
		}

		return {
			init: init,
			recordHistory: recordHistory,
			shouldRecord: shouldRecord
		}
	}());
    var themeTracker = (function(){

        var init = function()
        {
            setLastThemePlace();
        };
        var isLocalStorageEnabled = function()
        {
            return Modernizr.localstorage;
        };

        var setLastThemePlace = function()
        {
            $("body").on("wow.themechange", function(event,data){
                if(isLocalStorageEnabled())
                {
                    localStorage.setItem("lastThemePlace",window.location.href);
                }
            });
        };

        var getLastThemePlace = function()
        {
            if(isLocalStorageEnabled())
            {
                var themePlace = JSON.parse(localStorage.getItem("lastThemePlace"));
                console.log(themePlace);
                return themePlace;
            }
        };

        return{

            getLastThemePlace:getLastThemePlace,
            init:init
        }

    }());
	var scroller = (function() {
		var $this = null;

		var methods = {
			init : function(options) {
				return this.each(function(){
					$this = $(this);

					$this.smoothDivScroll({
						touchScrolling: true,
						visibleHotSpotBackgrounds: "hover",
						mousewheelScrolling: "allDirections",
						mousewheelScrollingStep: 70,
						countOnlyClass: ".hz-item",
						setupComplete: function(eventObj, data) {
							$this.hide().css('visibility', 'visible').fadeIn();
							$("div.scrollWrapper", $this).scrollspy({'target' : '.subthemenav'});
							historyManager.init();

                            if (window.location.hash == '') {
                                window.location.hash = 'home';
                            }

							var elem = $('#_' + window.location.hash.replace('#', '')).get(0);
							if (elem) {
								$this.smoothDivScroll('scrollToElement', 'id', elem.id);
							}

							$('a[href*="#"]').click(function(e) {
								e.preventDefault();

								var url = $(this).attr('href');
								var newUrl = url.substring(url.indexOf("#") + 1);

								historyManager.shouldRecord(false);
								$this.smoothDivScroll('scrollToElement', 'id', newUrl);
							});
						},
						scrolledToElementId : function(element) {
							historyManager.recordHistory();
							historyManager.shouldRecord(true);

                            // We need to remove the space we add at the start. Events that need to occur.
                            if ($('div.scroll-spacer').length > 0)
                                $this.trigger('scroller.remove', 'div.scroll-spacer');
						}
					});

					$this.bind('dragstart', function(e) { e.preventDefault(); });
                    $(document).bind('scroller.remove', function(e, dom) {
                        $(document).trigger('scroller.beforeRemove', [dom]);

                        $(dom).remove();
                        $this.smoothDivScroll('recalculateScrollableArea');

                        // setup our nav again to recalc the offsets properly
                        $("div.scrollWrapper", $this).data('scrollspy').refresh();

                        // scroll to location we actually wanted.
                        var elem = $('#_' + window.location.hash.replace('#', '')).get(0);
                        if (elem) {
                            $this.smoothDivScroll('jumpToElement', 'id', elem.id);
                        }

                        $(document).trigger('scroller.afterRemove', [dom]);
                    });
				});
			}
		}

		return methods;
	}());

	// Define our jQuery plugin around the scroller object.
	$.fn.scroller = function(method) {
		// Method calling logic
		if (scroller[method]) {
			return scroller[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return scroller.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.scroller');
		}
	};

	$(document).ready(function() {
		$('#image-scroller').scroller();

        themeTracker.init();
        $("body").on("wow.themechange", function(event,data){
            _gaq.push(['_trackEvent', 'themeView', 'navigateTo', data.section]);
        });

        $("a.poster-modal").posterOverlay();
	});




})(jQuery);

(function($) { //only available to JQuery



    $.fn.posterOverlay=function(settings)
    {
        $.fn.posterOverlay.defaults = {

            opacity:0.7,
            action:'click dblclick',
            dialog:'poster'
        };


        var self = this;

        settings = $.extend({}, $.fn.posterOverlay.defaults, settings);



        $(self).bind(settings.action,function(e){
            e.preventDefault();
            setOverlay(settings.opacity,'body');

            var elem = $("<div id=\""+settings.dialog + "\"/>");

            $('body').prepend(elem)
            $("#"+settings.dialog).css("width","95%").css("height","95%");

            $("#"+settings.dialog).center()
                .css('display','block')
                .css('background',"#000")
                .css('z-index','10001');


            loadContent($(this).attr('href'));
        });


        var setOverlay = function(opacity,target)
        {
            var elem = $("<div />")
                .css('width', jQuery(document).width() + 'px')
                .css('height', jQuery(document).height() + 'px')
                .css('position', 'fixed')
                .css('top', '0')
                .css('left', '0')
                .css('z-index', '35')
                .css('background','#fff')
                .addClass("posteroverlay");

            $(target).prepend(elem);
            elem.fadeTo('fast',opacity);

        };


        var loadContent =function(contentLink)
        {
            console.log("loading content " + contentLink);

            var posterView  = $("<iframe />").css("width","100%").css("height","100%").css("border", "none").attr("src", contentLink);
            var closeButton = $("<a href='#close' class='posterclose'></a>").css('top', '-15px')
                .css('left', '97.5%')
                .css('z-index', '10035');
            $('#'+settings.dialog).prepend(closeButton).append(posterView);

           //create a close button div and

            $('.posterclose').bind('click',function(e){
                e.preventDefault();
                removeDialog("#"+ settings.dialog);
            })
        };


        $(document.documentElement).keyup(function (event) {
            if (event.keyCode == 27 ){

                removeDialog("#"+ settings.dialog);

            }

        });

        var removeDialog = function(target)
        {
            $(target).find('a').remove();
            $(target).remove();
            $(".posteroverlay").remove();
        };



        jQuery.fn.center = function () {
            this.css("position","fixed");
            console.log(this.height());
            console.log(this.width());

            this.css("top",  (jQuery(window).height() - this.height() ) / 2 + "px");
            this.css("left", (jQuery(window).width() - this.width() ) / 2 + "px");
            return this;
        }



    }
})(jQuery);