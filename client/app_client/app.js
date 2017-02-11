(function () {
	angular.module('mySiteApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap']);

	function config ($routeProvider, $locationProvider, $httpProvider, $provide) {
		$routeProvider
		.when('/', {
			redirectTo: '/home'
		})
		.when('/home', {
			templateUrl: '/home/home.view.html',
			controller: 'homeCtrl',
			controllerAs: 'vm'
		})
		.otherwise({redirectTo: '/'});

		$locationProvider.html5Mode({
			enabled: true,
			requireBase: true,
			rewriteLinks: false
		});
	}

	angular
	.module('mySiteApp')
	.config(['$routeProvider', '$locationProvider', '$httpProvider', '$provide', config]);
})();