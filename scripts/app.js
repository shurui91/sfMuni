var app = angular.module('sf-muni', []);
app.value('mapsToLoad', [
	'assets/maps/neighborhoods.json',
	'assets/maps/streets.json'
]);

app.constant('agency', 'sf-muni');
app.constant('apiResponseType', 'publicJSONFeed');
