var morx = require('morx');
var q = require('q');
const axios = require('axios');
const package = require('../package.json');


var spec = morx.spec()
.build('page', 'required:false, eg:1')
.build('status', 'required:false, eg:successful')
.end();


function service(data,_rave) {
	
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "list all Transfers"
	   })
	   
	var d = q.defer();

	q.fcall(() => {

			var validated = morx.validate(data,spec, _rave.MORX_DEFAULT);
			var params = validated.params;
			
			return params

		})
		.then(params => {

			params.seckey = _rave.getSecretKey();
		params.method = "GET";
			return _rave.request('v2/gpx/transfers', params)

		})
		.then(response => {

		
			d.resolve(response.body);

		})
		.catch(err => {

			d.reject(err);

		})

	return d.promise;



}
service.morxspc = spec;
module.exports = service;
