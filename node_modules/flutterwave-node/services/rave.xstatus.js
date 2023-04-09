var morx = require('morx');
var q = require('q');
const axios = require('axios');
const package = require('../package.json');

var spec =  morx.spec() 
				.build('flwref', 'required:false,map:flwref, eg:FLW001') 
				.build('txref', 'required:false,map:txref, eg:MC-001') 
				.build('last_attempt', 'required:false')
				.build('only_successful', 'required:false')
				.end();

function service(data, _rave){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "Xrequery"
	   })

	var d = q.defer();

	q.fcall( () => {

		var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
		var params = validated.params;

		if(!params.flwref && !params.txref) throw new Error('You must pass either flwref or txref');

		return params;

	})
	.then( params  => {

		 
		params.SECKEY = _rave.getSecretKey();  
		return _rave.request('flwv3-pug/getpaidx/api/v2/xrequery', params)
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