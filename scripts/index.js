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

		// load everything using queue
		let queue = d3.queue();
		mapsToLoad.forEach(mapToLoad => {
			queue.defer(d3.json, mapToLoad, prepareMap);
		});

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

		function calculateBounds(json) {
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
			projection.scale(scale).translate(translate);
		}

		function fetchRouteList() {
			routeListFactory.getRoutes().then(
				routes => {
					$scope.routes = routes;
					$scope.selectedRoute = $scope.routes[0];
					$scope.getVehicleLocations(true);
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

		// drawVehicle function
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

		// get vehicle locations
		$scope.getVehicleLocations = function(fetchStopsAlso) {
			vehicleLocationFactory
				.getVehicleLocations($scope.selectedRoute.tag)
				.then(
					vehicles => {
						removeAllVehicles();
						if (vehicles.length === 0) {
							removeAllStops();
							showMessageBanner(
								'error',
								'Error',
								'No vehicles found for this route!'
							);
							return;
						}
						// draw vehicles again
						vehicles.forEach(vehicle => {
							drawVehicle(vehicle);
						});

						if (fetchStopsAlso) {
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

		// show message banner
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

		// zoom function
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
