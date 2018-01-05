var testingAngluarApp = angular.module('testingAngularApp', []);

testingAngluarApp.controller('testingAngularCtrl', function ($scope, $http, $timeout, $rootScope) {

    $scope.title = "Testing AngularJS Applications";

    $scope.apiId = '5e96cdb94e216c5429885bdc9eb1e5b5';
    
    $scope.destinations = [];
    // [
    //     {
    //         city: 'Rajkot',
    //         state: 'Gujarat'
    //     },
    //     {
    //         city: 'Pune',
    //         state: 'Maharashtra'
    //     }
    // ];

    $scope.newDestination = {
        city: undefined,
        state: undefined
    }

    $scope.addDestination = function(){
        $scope.destinations.push({
            city: $scope.newDestination.city,
            state: $scope.newDestination.state
        });
        $scope.newDestination = {};
    }

    $scope.removeDestination = function(index){
        $scope.destinations.splice(index, 1);
    }

 

    $rootScope.messageWatcher = $rootScope.$watch('message', function() {
        if($rootScope.message) {
            $timeout(function() {
                $rootScope.message = null;
            }, 3000);
        }
    })

});

testingAngluarApp.filter('warmestDestinations', function() {
    return function(destinations, minTemp) {
        var warmestDestinations = [];

        angular.forEach( destinations, function(destination){
            if(destination.weather && destination.weather.temp && destination.weather.temp >= minTemp) {
                warmestDestinations.push(destination);
            }
        })

        return warmestDestinations;
    }
});

testingAngluarApp.service('celciusToKelvin', function() {
    var request = {
        celciusToKelvin : celciusToKelvin
    }
    
    return request;

    function celciusToKelvin(temp){
        return (temp+273.15);
    }
})

testingAngluarApp.directive('destinationDirective', function(){
    return {
        scope: {
            destination: '=',
            apiId: '=',
            onRemove: '&'
        },
        template: '<span>{{destination.city}}, {{destination.state}}</span>'+
        '<span ng-if="destination.weather.main">{{destination.weather.main}}, {{destination.weather.temp}}&deg;C</span>'+
        '<span>---{{destination.weather.tempK}} K</span>'+
        '<button ng-click="onRemove()">Remove</button>'+
        '<button ng-click="getWeather(destination)">Update Weather</button>',
        controller: function($http, $rootScope, $scope, celciusToKelvin){
            $scope.getWeather = function(destination) {
                
                        $http.get('http://api.openweathermap.org/data/2.5/weather?units=metric&q='+destination.city+'&appid='+$scope.apiId)
                        .then(
                            function successCallback(response){
                                if(response.data.weather) {
                                    destination.weather = {};
                                    destination.weather.main = response.data.weather[0].main;
                                    destination.weather.temp = response.data.main.temp;
                                    destination.weather.tempK = celciusToKelvin.celciusToKelvin(response.data.main.temp);
                                }
                                else {
                                    $rootScope.message = "Error! City not found !!";
                                }
                            },
                            function errorCallback(err){
                                if(err.data && err.data.cod && err.data.cod == "404"){
                                    $rootScope.message =  "Error! City not found !!";
                                }
                                else {
                                    $rootScope.message =  "Server Error !!";
                                    $rootScope.$broadcast('messageUpdated');
                                }
                            }
                        )
                    }
            }

        }
})
