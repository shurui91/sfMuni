angular.module("sf-muni")
    /**
     * Fetches the stops which are part of the selected route. The stops are categorized
     * based on directions.
     */
    .factory('vehicleDirectionFactory', ["$http", "$q", "apiResponseType", "agency", function($http, $q, apiResponseType, agency) {
        let baseUrl = "http://webservices.nextbus.com/service/" + apiResponseType + "?a=" + agency + "&";

        return {
            getDirectionsForRoute: (selectedRoute) => {
                let defer = $q.defer();
                $http({
                    method: "GET",
                    url: baseUrl + "command=routeConfig&terse=true&r=" + selectedRoute
                }).then(function successCallback(response) {
                    let vehicleDirectionResponse = [],
                        route = response.data.route;
                    if (undefined !== route && undefined !== route.direction) {
                        let stops = route.stop,
                            stopsByRoute = new Map();
                        stops.forEach((stop) => {
                            stopsByRoute.set(stop.tag, {
                                lat: stop.lat,
                                lon: stop.lon,
                                title: stop.title
                            });
                        });

                        let directions = route.direction;
                        directions.forEach((direction) => {
                            // If the direction is important for the UI.
                            if (direction.useForUI) {
                                let stops = direction.stop;
                                stops.forEach((stop) => {
                                    let coordinates = [
                                        stopsByRoute.get(stop.tag).lon,
                                        stopsByRoute.get(stop.tag).lat
                                    ];
                                    vehicleDirectionResponse.push({
                                            tag: direction.tag,
                                            coordinates: coordinates
                                        }
                                    );
                                });
                            }
                        });
                    }
                    defer.resolve(vehicleDirectionResponse);
                }, function errorCallback(response) {
                    defer.reject(new Array());
                });

                return defer.promise;
            }
        };
    }]);