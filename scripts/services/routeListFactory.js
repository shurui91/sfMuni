angular.module("sf-muni")
    /**
     * Fetches the list of all routes based on `agencyType`.
     */
    .factory('routeListFactory', ["$http", "$q", "apiResponseType", "agency", function($http, $q, apiResponseType, agency) {
        let baseUrl = "http://webservices.nextbus.com/service/" + apiResponseType + "?a=" + agency + "&";

        return {
            getRoutes: () => {
                let defer = $q.defer();
                $http({
                    method: "GET",
                    url: baseUrl + "command=routeList"
                }).then(function successCallback(response) {
                    if (response.data.route.length > 0) {
                        defer.resolve(response.data.route);
                    } else {
                        defer.reject(new Array());
                    }
                }, function errorCallback(response) {
                    defer.reject(new Array());
                });

                return defer.promise;
            }
        };
    }]);