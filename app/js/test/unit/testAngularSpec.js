describe("Angular JS Unit Test", function(){
    var scope, rootScope, ctrl, timeout;

    beforeEach(
        module("testingAngularApp")
    )

    describe("It should test Controller", function(){
        
        beforeEach(inject(function($rootScope, $controller, $timeout ){
            rootScope = $rootScope;
            scope = $rootScope.$new();
            ctrl = $controller('testingAngularCtrl', {$scope: scope});
            timeout = $timeout;
        }));

        it("should test title", function(){
            expect(scope.title).toBe("Testing AngularJS Applications")
        })

        it('Should add 2 destinations to the destinations list', function() {
            expect(scope.destinations).toBeDefined();
            expect(scope.destinations.length).toBe(0);
            
            scope.newDestination = {
                city: 'Rajkot',
                state: 'Gujarat'
            }

            scope.addDestination();

            expect(scope.destinations.length).toBe(1);
            expect(scope.destinations[0].city).toBeDefined('Rajkot');
            expect(scope.destinations[0].state).toBeDefined('Gujarat');

            scope.newDestination.city = 'Pune';
            scope.newDestination.state = 'Maharashtra';

            scope.addDestination();
            expect(scope.destinations.length).toBe(2);
            expect(scope.destinations[1].city).toBeDefined('Pune');
            expect(scope.destinations[1].state).toBeDefined('Maharashtra');
            expect(scope.destinations[0].city).toBeDefined('Rajkot');
            expect(scope.destinations[0].state).toBeDefined('Gujarat');            
        })

        it('Should remove destination from the destinations list', function() {          

            scope.destinations = [
                {
                    city: 'Rajkot',
                    state: 'Gujarat'
                },
                {
                    city: 'Pune',
                    state: 'Maharashtra'
                }
            ];
            expect(scope.destinations).toBeDefined();
            expect(scope.destinations.length).toBe(2);

            scope.removeDestination(0);
            
           
            expect(scope.destinations.length).toBe(1);
            expect(scope.destinations[0].city).toBe('Pune');
            expect(scope.destinations[0].state).toBe('Maharashtra');

            scope.removeDestination(0);

            expect(scope.destinations.length).toBe(0);
        })

        it('should remove error message after fixed period of time', function() {
            rootScope.message = 'Error';

            expect(rootScope.message).toBe('Error');

            rootScope.$apply();
            timeout.flush();

            expect(rootScope.message).toBe(null);
        })

    });

    describe('Testing Angular JS Filter', function(){
        
        it('Filtering the warmest city using warmDestinations Filter', inject(function($filter){
            var warmest = $filter('warmestDestinations');

            var destinations = [
                {
                    city: 'Rajkot',
                    state: 'Gujarat',
                    weather: {
                        temp: 35
                    }
                },
                {
                    city: 'Ahmedabad',
                    state: 'Gujarat',
                    weather: {
                        temp: 20
                    }
                },
                {
                    city: 'Pune',
                    state: 'Maharashtra',
                    weather: {
                        temp: 20
                    }
                },
                {
                    city: 'Nagpur',
                    state: 'Maharashtra',
                    weather: {
                        temp: 45
                    }
                }
            ];

            expect(destinations.length).toBe(4);

            var warmestDestinations = warmest(destinations, 25);

            expect(warmestDestinations.length).toBe(2);

            expect(warmestDestinations[0].city).toBe('Rajkot');
            expect(warmestDestinations[1].city).toBe('Nagpur');
        }))
        
    })

    describe('Testing service', function() {
        it('convert C to F', inject(function(celciusToKelvin){
            var temp = celciusToKelvin.celciusToKelvin(10);

            expect(temp).toBe(283.15);
        }))
    })
        
    describe('Testing Angular js directive', function(){
        var scope, httpBackend, template, isolateScope, rootScope;

        beforeEach( function(){
            module(function($provide){
                var celciusToKelvin = {
                    celciusToKelvin : function(temp) {
                        return (temp+273.15);
                    }
                }

                $provide.value('celciusToKelvin', celciusToKelvin);
            
            })

        })

        beforeEach( inject( function($compile, $rootScope, $httpBackend, _celciusToKelvin_){
            rootScope = $rootScope;
            scope= $rootScope.$new();
            httpBackend = $httpBackend;
            celciusToKelvin = _celciusToKelvin_;
            scope.destination = {
                    city: 'Rajkot',
                    state: 'Gujarat'
                }

            var element = angular.element(
            '<div destination-directive destination="destination" api-id="apiId" on-remove="remove()">'
            );

            template = $compile(element)(scope);
            scope.$digest();

            isolateScope = element.isolateScope();

        }))

        it('should update weather for specific destination', function() {
            spyOn(celciusToKelvin, 'celciusToKelvin').and.callThrough()
            
            scope.destination = {
                city: 'Rajkot',
                state: 'Gujarat'
            };

            httpBackend.expectGET('http://api.openweathermap.org/data/2.5/weather?units=metric&q='+
                scope.destination.city+'&appid='+scope.apiId).respond(
                    {
                        weather: [{ main: 'Rain'}],
                        main: {temp: 30}
                    }
                );

            isolateScope.getWeather(scope.destination);

            httpBackend.flush();

            expect(scope.destination.weather.main.main).toBe('Rain');
            expect(scope.destination.weather.temp).toBe(30);
            expect(scope.destination.weather.tempK).toBe(303.15 );
            expect(celciusToKelvin.celciusToKelvin).toHaveBeenCalledWith(30);
        })

        it('should show error message if no city found', function() {
            scope.destination = {
                city: 'Rajkot',
                state: 'Gujarat'
            };

            httpBackend.expectGET('http://api.openweathermap.org/data/2.5/weather?units=metric&q='+
                scope.destination.city+'&appid='+scope.apiId).respond(404,
                    {
                        "cod":"404"
                    }
                );

            isolateScope.getWeather(scope.destination);

            httpBackend.flush();

            expect(rootScope.message).toBe('Error! City not found !!');
        })

        it('should show error message if status 200 but city not found', function() {
            scope.destination = {
                city: 'Rajkot',
                state: 'Gujarat'
            };

            httpBackend.expectGET('http://api.openweathermap.org/data/2.5/weather?units=metric&q='+
                scope.destination.city+'&appid='+scope.apiId).respond(
                    {
                        "cod":"404"
                    }
                );

            isolateScope.getWeather(scope.destination);

            httpBackend.flush();

            expect(rootScope.message).toBe('Error! City not found !!');
        })

        it('should show error message if server error', function() {
            spyOn(rootScope, '$broadcast');
            
            scope.destination = {
                city: 'Rajkot',
                state: 'Gujarat'
            };

            httpBackend.expectGET('http://api.openweathermap.org/data/2.5/weather?units=metric&q='+
                scope.destination.city+'&appid='+scope.apiId).respond(500);

                isolateScope.getWeather(scope.destination);

            httpBackend.flush();

            expect(rootScope.message).toBe('Server Error !!');
            expect(rootScope.$broadcast).toHaveBeenCalled();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('messageUpdated');
            expect(rootScope.$broadcast.calls.count()).toBe(1);
        })


        it('should call the parent controller remove function', function(){
            scope.removeTest = 1;

            scope.remove = function(){
                scope.removeTest++;
            }

            scope.remove();

            expect(scope.removeTest).toBe(2);
        })

        it('it should generate the correct html', function(){
            var templateAsHtml = template.html();

            expect(templateAsHtml).toContain("Rajkot");

            scope.destination.city = "Pune";
            scope.destination.state = "Maharashtra";

            scope.$digest();
            templateAsHtml = template.html();

            expect(templateAsHtml).toContain("Pune");            
        })

    })
})