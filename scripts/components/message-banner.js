function MessageBannerController() {}
angular.module('sf-muni').component('messageBanner', {
	templateUrl: 'scripts/components/views/message-banner.html',
	controller: [MessageBannerController],
	bindings: {
		description: '<',
		title: '<',
		type: '<',
		showBanner: '='
	}
});
