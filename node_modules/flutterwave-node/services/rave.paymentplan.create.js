var morx = require('morx');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');



//This allows you fetch all transfers

var spec = morx.spec()
	
.build('amount', 'required:true, eg:1000')
.build('name', 'required:true, eg:School fees')
.build('interval', 'required:true, eg:daily')
.build('duration', 'required:true, eg:School 5')
.end();


function service(data,_rave) {
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Create payment plan"
       })

	var d = q.defer();

	q.fcall(() => {

			var validated = morx.validate(data,spec, _rave.MORX_DEFAULT);
			var params = validated.params;
			
			return params

		})
		.then(params => {

			params.seckey = _rave.getSecretKey();
		params.method = "POST";
			return _rave.request('v2/gpx/paymentplans/create', params)

		})
		.then(response => {

		
			d.resolve(response);

		})
		.catch(err => {

			d.reject(err);

		})

	return d.promise;



}
service.morxspc = spec;
module.exports = service;

