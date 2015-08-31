(function () {
	'use strict';
	angular
		.module('angular-owl-carousel', [])
		.directive('owlCarousel', [
			'$timeout',
			owlCarouselDirective
		]);

	function owlCarouselDirective($timeout) {
    return {
			restrict: 'E',
      scope: {
        index: "=owlIndex",
        options: "=owlOptions"
      },
			link: function (scope, element, attributes, controller) {

				var options = {
					items: 1,
					nav: true,
					navText: ['','']
				};
				var	$element = $(element);
				var	owlCarousel = null;
				var	propertyName = attributes.owlCarousel;
        var initialized = false;

        if(scope.options !== undefined) {
          angular.extend(options, scope.options);
        }

        var getOwlOptions = function() {
          var options = {};
          angular.forEach(attributes, function(value, key) {
            if(key.match(/^owlOptions[\w|\-]+/)) {
              var opt;
              opt = key.replace(/^owlOptions/, "");
              opt = opt.charAt(0).toLowerCase() + opt.substr(1);
              value = eval('(' + value + ')');

              if(opt == "options") {
                angular.extend(options, value);
              } else {
                options[opt] = value;
              }
            }
          });
          return options;
        }

        var initialize = function() {
          angular.extend(options, getOwlOptions());
          return $timeout(function() {
            var currentIndex;
            if (scope.index != null) {
              currentIndex = scope.index;
            }
            $element.owlCarousel(options);
            owlCarousel = $element.data('owlCarousel');

            $element.on("changed.owl.carousel", function(e) {
              $timeout(function(){
                currentIndex = e.item.index;
                scope.index = e.item.index;
              });
            });

            return scope.$watch('index', function (newVal, oldVal) {
              if (currentIndex != null && newVal != null && newVal !== currentIndex) {
                return owlCarousel.to(newVal, 0, true);
              }
            });
          });
        }
        //debugger
        return initialize();
      }
		};
	}

})();
