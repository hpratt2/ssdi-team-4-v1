/* APP */
var app = angular.module('winevault',['ngRoute']);

/* ROUTE CONFIGURATION */
app.config(function($routeProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'views/winelist.htm',
			controller: 'mainCtrl'
		})
		.when('/similarwine/:id', {
			templateUrl: 'views/similarresults.htm',
			controller: 'similarWineCtrl'
		})
		.when('/advancedsearch/', {
			templateUrl: 'views/advancedsearch.htm',
			controller: 'advSearchCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
});

/* MAIN CONTROLLER */
app.controller('mainCtrl', function($scope, $http, $location, $routeParams){
	/* wine list sorting options */
	$scope.sortOptions = [
		{name:'Avg. Rating', value:'-avgRating'},
		{name:'Name: A - Z', value:'name'},
		{name:'Name: Z - A', value:'-name'},
		{name:'Price: Low to High', value:'priceLow'},
		{name:'Price: High to Low', value:'-priceHigh'}
	];
	
	/* country filter options - populated on HTTP GET */
	$scope.countryOptions = [];
	
	/* rating filter options - updated on HTTP GET */
	$scope.minRating = 100; // initially high to get rating minimum
	$scope.maxRating = 0;	// initially low to get rating maximum
	
	/* results per page options */
	$scope.rppOptions = [25, 50, 100];
	
	/* initial page settings */
	$scope.currentPage = 0;	// first page
	$scope.rpp = 25;		// 25 results per page
	$scope.numPages = 1;	// number of pages of results
	
	/* function to update wine details view based on wine id */
	$scope.viewDetails = function(id){ $scope.wid = id; }
	
	/* function to go to similar wines page */
	$scope.findSimilarWines = function(id){
		$location.path('similarwine/' + id);
	}
	
	/* fetch the wines from the back-end */
	$http.get('rest/winelist').then(function(response){
		$scope.status = response.status;
		$scope.wines = response.data;
		
		// update country and rating filter options and attach reviews to wines
		for(let wine of $scope.wines){
			if(wine.country != null && !existsInSet($scope.countryOptions, "name", wine.country)){
				$scope.countryOptions.push({name:wine.country, value:wine.country});
			}
			
			if(wine.avgRating < $scope.minRating){ $scope.minRating = wine.avgRating; }
			if(wine.avgRating > $scope.maxRating){ $scope.maxRating = wine.avgRating; }
			
			$http.get('rest/reviews/' + wine.id).then(function(reviewResponse){
				wine.reviews = reviewResponse.data;
			});
		}
		
		// sort the country options alphabetically
		$scope.countryOptions.sort(function(a,b){
			if(a.name < b.name) return -1;
			else if(a.name > b.name)  return 1;
			else return 0;
		});
		
		// prepend the "Any" country option & append the '[Unknown]' country options
		$scope.countryOptions.unshift({name: 'Any', value: ''});
		$scope.countryOptions.push({name: '[Unknown]', value: null});
	});
});

/* SIMILAR WINE CONTROLLER */
app.controller('similarWineCtrl', function($scope, $http, $routeParams, $location){
	// TODO
	var url = $location.path().split('/');
	$http.get('rest/wine/' + url[2]).then(function(response){
		$scope.basewine = response.data;
	});
	$http.get('rest/similarwine/' + url[2]).then(function(response){
		$scope.searchResults = response.data;
		for(let wine of $scope.searchResults){
			$http.get('rest/reviews/' + wine.id).then(function(reviewResponse){
				wine.reviews = reviewResponse.data;
			});
		}
	});
});

/* FILTERS */
app.filter("ratingFilter", function($filter){
	return function(wines, minRating, maxRating){
		if(!angular.isDefined(minRating) || !angular.isDefined(maxRating)){
			return wines;
		}
		
		var results = [];
		angular.forEach(wines, function(wine){
			if(wine.avgRating >= minRating && wine.avgRating <= maxRating){
				results.push(wine);
			}
		});
		return results;
	}
});

app.filter('countryFilter', function(){
	return function(wines, country){
		if(!angular.isDefined(country) || (country != null && country.length == 0)){
			return wines;
		}
		
		var results = [];
		angular.forEach(wines, function(wine){
			if(wine.country === country){
				results.push(wine);
			}
		});
		return results;
	}
});

app.filter('startFrom',function(){
	return function(input,start){
		if(input){
			start = +start;
			return input.slice(start);
		}
	}
})

app.filter('ceiling', function(){
	return function(value){
		if(isNaN(value)){ return 1; }
		return Math.ceil(value);
	}
});

/* UTIL */
function existsInSet(set, fieldname, value){
	return set.some(function(item){
		return item[fieldname] === value;
	});
}