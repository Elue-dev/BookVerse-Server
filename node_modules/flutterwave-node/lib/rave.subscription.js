
var listSubscription = require('../services/rave.subscription.list');
var fetchSubscription = require('../services/rave.subscription.fetch');
var activateSubscription = require('../services/rave.subscription.activate');
var cancelSubscription = require('../services/rave.subscription.cancel');

function Subscription(RaveBase){

	this.list = function (data) {

		return listSubscription(data, RaveBase);

	}

	this.fetch = function (data) {

		return fetchSubscription(data, RaveBase);

    }
    
    this.activate = function (data) {
        return activateSubscription(data, RaveBase)
    }

    this.cancel = function (data) {
        return cancelSubscription(data, RaveBase)
    }


}
module.exports = Subscription;