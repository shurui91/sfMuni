var app = angular.module('sf-muni', []);
// Add any feature map here which you want to show add here.
app.value('mapsToLoad', [
	'assets/maps/neighborhoods.json',
	'assets/maps/streets.json'
]);
// this can be set to any of the valid agencies exposed by next bus web service.
// http://webservices.nextbus.com/service/publicJSONFeed?command=agencyList
app.constant('agency', 'sf-muni');
app.constant('apiResponseType', 'publicJSONFeed');
