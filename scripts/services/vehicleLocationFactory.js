angular.module("sf-muni")
    /**
     * Fetches the locations of the vehicles part of the selected route.
     */
    .factory('vehicleLocationFactory', ["$http", "$q", "apiResponseType", "agency", function($http, $q, apiResponseType, agency) {
        let baseUrl = "http://webservices.nextbus.com/service/" + apiResponseType + "?a=" + agency + "&";

        return {
            getVehicleLocations: (selectedRoute) => {
                let defer = $q.defer();
                $http({
                    method: "GET",
                    url: baseUrl + "command=vehicleLocations&t=0&r=" + selectedRoute
                }).then(function successCallback(response) {
                    let vehicleLocationResponse = [];
                    // If selected route has vehicle information.
                    if (undefined !== response.data.vehicle) {
                        let vehicles = response.data.vehicle;
                        // If it's a single object and there is direction info.
                        if (!Array.isArray(vehicles) && vehicles.heading > 0) {
                            vehicleLocationResponse.push(vehicles);
                        }
                        // If it's an array of objects.
                        if (Array.isArray(vehicles)) {
                            vehicles.forEach((vehicle) => {
                                // If the heading is negative means the vehicle is static or not moving.
                                if (vehicle.heading > 0) {
                                    vehicleLocationResponse.push(vehicle);
                                }
                            });
                        }
                    }

                    defer.resolve(vehicleLocationResponse);
                }, function errorCallback(response) {
                    defer.reject(new Array());
                });

                return defer.promise;
            }
        };
    }]);