/*
	@TODO
	3. Writing unit tests.
*/
angular.module('sf-muni').controller('MapController', [
	'$scope',
	'$interval',
	'mapsToLoad',
	'vehicleLocationFactory',
	'vehicleDirectionFactory',
	'routeListFactory',
	function(
		$scope,
		$interval,
		mapsToLoad,
		vehicleLocationFactory,
		vehicleDirectionFactory,
		routeListFactory
	) {
		let projection = d3
				.geoMercator()
				.scale(1)
				.translate([0, 0]),
			path = d3.geoPath().projection(projection),
			width = '700',
			height = '500',
			svg = d3
				.select('svg')
				.attr('width', width)
				.attr('height', height),
			bounds,
			scale,
			translate;
		const mapZoomFactor = 0.1;

		$scope.messagesForUser = {
			show: false
		};

		// Get the queue to defer expensive operations.
		let queue = d3.queue();
		mapsToLoad.forEach(mapToLoad => {
			// load each map.
			queue.defer(d3.json, mapToLoad, prepareMap);
		});
		// Called once all the operations in the queue are completed.
		queue.awaitAll(error => {
			if (error) {
				throw error;
			} else {
				showMessageBanner(
					'success',
					'Success',
					'All maps loaded successfully!'
				);
			}
		});

		/**
		 * Prepare the map by appending features
		 *
		 * @param {JSON} json
		 */
		function prepareMap(json) {
			// The bounds remain the same for the whole map so do not
			// calculate again.
			if (undefined === bounds) {
				calculateBounds(json);
			}

			if (json['use-case'] === 'neighborhoods') {
				svg
					.selectAll('path')
					.data(json.features)
					.enter()
					.append('path')
					.attr('d', path)
					.attr('name', 'neighborhood');
			} else {
				svg
					.selectAll('path')
					.data(json.features)
					.enter()
					.append('path')
					.attr('d', path);
			}
		}

		/**
		 * Calculates the bound of the map and converts the coordinates
		 * of the features to projected coordinates.
		 * @param {JSON} json GeoJson containing the features
		 */
		function calculateBounds(json) {
			// Calculate bounding box transforms for entire dataset.
			(bounds = path.bounds(json)),
				(scale =
					0.95 /
					Math.max(
						(bounds[1][0] - bounds[0][0]) / width,
						(bounds[1][1] - bounds[0][1]) / height
					)),
				(translate = [
					(width - scale * (bounds[1][0] + bounds[0][0])) / 2,
					(height - scale * (bounds[1][1] + bounds[0][1])) / 2
				]);

			// Update the projection.
			projection.scale(scale).translate(translate);
		}

		function fetchRouteList() {
			routeListFactory.getRoutes().then(
				routes => {
					$scope.routes = routes;
					$scope.selectedRoute = $scope.routes[0];
					$scope.getVehicleLocations(true);
					// Get the vehicle locations after every 15 seconds. Every call to the
					// method does not check for scope changes since we dont really change in the scope.
					// If we were then the 3 parameter should be true
					$interval(
						$scope.getVehicleLocations,
						15000,
						0,
						false,
						false
					);
				},
				error => {
					showMessageBanner(
						'error',
						'Error',
						'Error occured while getting routes!'
					);
				}
			);
		}

		/**
		 * Plots the vehicle on the map. The vehicle svg is rotated
		 * according to the direction in which the vehicle is headed.
		 * @param {object} vehicle The vehicle object.
		 */
		function drawVehicle(vehicle) {
			let x = projection([vehicle.lon, vehicle.lat])[0],
				y = projection([vehicle.lon, vehicle.lat])[1];

			svg
				.append('svg:image')
				.attr('xlink:href', 'assets/images/up-arrow.svg')
				.attr('id', vehicle.id)
				.attr('name', 'vehicles')
				.attr('width', 10)
				.attr('height', 10)
				.attr(
					'transform',
					' translate(' +
						x +
						', ' +
						y +
						') rotate(' +
						parseInt(vehicle.heading) +
						')'
				);
		}

		/**
		 * Fetches the locations of the vehicles for the route selected.
		 *
		 * @param {boolean} fetchStopsAlso After fetching the locations we fetch the stops also only if
		 * 								   the param is set to true.
		 */
		$scope.getVehicleLocations = function(fetchStopsAlso) {
			vehicleLocationFactory
				.getVehicleLocations($scope.selectedRoute.tag)
				.then(
					vehicles => {
						// Remove all the vehicles from the previous route.
						removeAllVehicles();
						if (vehicles.length === 0) {
							// Remove all the stops from the previous route.
							removeAllStops();
							showMessageBanner(
								'error',
								'Error',
								'No vehicles found for this route!'
							);

							return;
						}
						// Draw vehicles on the newly fetched locations.
						vehicles.forEach(vehicle => {
							drawVehicle(vehicle);
						});

						if (fetchStopsAlso) {
							// Remove all the stops from the previous route.
							removeAllStops();
							fetchStopsByRoute();
						}
					},
					error => {
						showMessageBanner(
							'error',
							'Error',
							'Error occured while getting locations!'
						);
					}
				);
		};

		/**
		 * Method to configure and show the message banner.
		 *
		 * @param {String} type Type of message, can be error or success.
		 * @param {String} title Title of the message.
		 * @param {String} description Descriptions of the message.
		 */
		function showMessageBanner(type, title, description) {
			$scope.messagesForUser.show = true;
			$scope.messagesForUser.title = title;
			$scope.messagesForUser.type = type;
			$scope.messagesForUser.description = description;
		}

		function removeAllVehicles() {
			d3.selectAll("[name='vehicles']").remove();
		}

		function removeAllStops() {
			d3.selectAll("[name='vehicle-stop']").remove();
		}

		/**
		 * Draws stops part of different directions of the route.
		 * Stops of different direction have a different color.
		 * @param {Array} coordinates lat-lon of the stop.
		 * @param {String} color color code of the stop.
		 */
		function drawStops(coordinates, color) {
			svg
				.append('circle')
				.attr('cx', function(d) {
					return projection(coordinates)[0];
				})
				.attr('cy', function(d) {
					return projection(coordinates)[1];
				})
				.attr('r', '1px')
				.attr('name', 'vehicle-stop')
				.attr('fill', color);
		}

		/**
		 * Fetches the stops which are part of a route. Each route has multiple directions.
		 * So we plot all the routes which are part of each direction.
		 */
		function fetchStopsByRoute() {
			vehicleDirectionFactory
				.getDirectionsForRoute($scope.selectedRoute.tag)
				.then(
					directions => {
						let directionColorMap = new Map();
						color = 'red';
						directions.forEach(direction => {
							// New color of stop for each direction so as to distinguish between
							// stops part of a different direction.
							if (directionColorMap.has(direction.tag)) {
								color = directionColorMap.get(direction.tag);
							} else {
								color = d3.hsl(Math.random() * 360, 100, 60);
								directionColorMap.set(direction.tag, color);
							}

							drawStops(direction.coordinates, color);
						});
					},
					error => {
						showMessageBanner(
							'error',
							'Error',
							'Error occured while getting locations!'
						);
					}
				);
		}

		/**
		 * Increase/decrease the zoom level of the svg map by 10%.
		 * @param {boolean} increase If true then increase the zoom level else decrease.
		 */
		$scope.modifyZoomLevel = function(increase) {
			let currentZoomLevel = parseFloat(svg.style('zoom'));
			if (increase) {
				currentZoomLevel += currentZoomLevel * mapZoomFactor;
			} else {
				currentZoomLevel -= currentZoomLevel * mapZoomFactor;
			}

			svg.style('zoom', currentZoomLevel);
		};

		fetchRouteList();
	}
]);
