angular
	.module('sf-muni')
	// fetch vehicle locations
	.factory('vehicleLocationFactory', [
		'$http',
		'$q',
		'apiResponseType',
		'agency',
		function($http, $q, apiResponseType, agency) {
			let baseUrl =
				'http://webservices.nextbus.com/service/' +
				apiResponseType +
				'?a=' +
				agency +
				'&';

			return {
				getVehicleLocations: selectedRoute => {
					let defer = $q.defer();
					$http({
						method: 'GET',
						url:
							baseUrl +
							'command=vehicleLocations&t=0&r=' +
							selectedRoute
					}).then(
						function successCallback(response) {
							let vehicleLocationResponse = [];
							// if we have the selected car information
							if (response.data.vehicle !== undefined) {
								let vehicles = response.data.vehicle;
								// if it is just one object
								if (
									!Array.isArray(vehicles) &&
									vehicles.heading > 0
								) {
									vehicleLocationResponse.push(vehicles);
								}
								// if there is more than one object
								if (Array.isArray(vehicles)) {
									vehicles.forEach(vehicle => {
										// push all the vehicle location one by one
										if (vehicle.heading > 0) {
											vehicleLocationResponse.push(
												vehicle
											);
										}
									});
								}
							}
							defer.resolve(vehicleLocationResponse);
						},
						function errorCallback(response) {
							defer.reject(new Array());
						}
					);
					return defer.promise;
				}
			};
		}
	]);
