(function () {
	'use strict';
	angular
		.module('angular-owl-carousel', [])
		.directive('owlCarousel', [
			'$timeout',
			'$rootScope',
			'$window',
			'$compile',
			'$parse',
			owlCarouselDirective
		])
		.directive('owlItem', [
			'$rootScope',
			'$timeout',
			'$compile',
			owlItemDirective
		]);

	function owlCarouselDirective($timeout, $rootScope, $window, $compile, $parse) {
    return {
			restrict: 'AEC',
      scope: {
        index: "=owlIndex",
        options: "=owlOptions",
				itemsLoaded: "="
      },
			link: function (scope, element, attributes, controller) {
				var initialized = false;
				var carouselId = attributes.owlCarouselItemsLoaded;
				var sheet = window.document.styleSheets[0];
				var options = {
					// smartSpeed: 325,
					navSpeed: 325,
				};
				var	$element = $(element);
				var	owlCarousel = null;
				var	propertyName = attributes.owlCarousel;
        var initialized = false;

				// sheet.insertRule('owl-carousel { display: none; }', sheet.cssRules.length);

        if(scope.options !== undefined) {
          angular.extend(options, scope.options);
        }

        var getOwlOptions = function() {
					var options = {
						nav: true,
						dots: false,
						navText: ['',''],
						freeScroll: false
					};
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
          var currentIndex;
          if (scope.index != null) {
            currentIndex = scope.index;
          }

					$element.on("initialized.owl.carousel", function(e) {
						if (element.find(".owl-item.cloned").find("[angular-id]").length) {
							var _items = $element.find(".owl-item:not(.cloned)");
							var _cloned = $element.find(".owl-item.cloned");
							angular.forEach(_cloned, function(clone) {
								var $clone = angular.element(clone).find("> *");
								var angularId = $clone.attr("angular-id");
								var copiedScope = _items.find("[angular-id=" + angularId + "]").scope();
								if (copiedScope) {
									var $elem = $compile(copiedScope.elementHTML)(copiedScope);
									$clone.replaceWith($elem);
								}
							});
						}
					});

					$element.owlCarousel(options);
					owlCarousel = $element.data('owl.carousel');
					scope.index = owlCarousel._current;

          $element.on("changed.owl.carousel", function(e) {
						$timeout(function() {
							currentIndex = owlCarousel._current;
              scope.index = owlCarousel._current;
						}, options.navSpeed);
          });
          return scope.$watch('index', function (newVal, oldVal) {
						if (newVal != oldVal && currentIndex != null && newVal != null && newVal !== currentIndex) {
							if (newVal - oldVal == 1) {
								owlCarousel.next();
							} else if (newVal - oldVal == -1) {
								owlCarousel.prev();
							} else {
              	owlCarousel.to(newVal, 1, true);
							}
						}
          });
        }

				if(scope.itemsLoaded !== undefined) {
					scope.$watch('itemsLoaded', function (itemsLoaded) {
						if(itemsLoaded) {
							initialize();
						}
					});
				} else {
					$timeout(function(){
						initialize();
					})
				}
      }
		};
	}

	function owlItemDirective($rootScope, $timeout, $compile) {
    return {
			restrict: 'E',
			transclude: true,
			template: "<ng-transclude/>",
			link: function (scope, element, attributes, controller) {
				if(attributes.directive) {
					element.attr("directive", null);
					element.attr("ng-repeat", null);
					element.attr("owl-carousel-items-loaded", null);
					element.attr("on-items-loaded", null);
					element.attr("angular-id", element.scope().$id);
					var elementHTML = element[0].outerHTML.replace("owl-item", attributes.directive);
					scope.elementHTML = elementHTML;
					var elementCompiled = $compile(elementHTML)(scope);
					element.replaceWith(elementCompiled);
				}
				if (scope.$last){
					scope.$eval(attributes.onItemsLoaded);
				}
			}
		}
	}

})();
