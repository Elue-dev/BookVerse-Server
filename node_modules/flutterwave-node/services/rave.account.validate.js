var morx = require('morx');
const package = require('../package.json');
var q = require('q');
const axios = require('axios');

var spec =  morx.spec()
				.build('otp', 'required:true, eg:4324')
				.build('transactionreference', 'required:true, eg:5590131743294314') 
				.end();

function service(data, _rave){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Validate account charge"
       })

	var d = q.defer();

	q.fcall( () => {

		var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
		var params = validated.params;

		return params;

	})
	.then( params  => {

		params.PBFPubKey = _rave.getPublicKey();  
		return _rave.request('flwv3-pug/getpaidx/api/validate', params)
	})
	.then( response => {

		//console.log(response);
		d.resolve(response);

	})
	.catch( err => {

		d.reject(err);

	})

	return d.promise;
	
	

}
service.morxspc = spec;
module.exports = service;