var morx = require('morx');
var q = require('q');
const axios = require('axios');
const package = require('../package.json');

//This allows you retrieve status of a bulk transfer

var spec =  morx.spec() 
				.build('flwref', 'required:false, eg:Flw-211')
				.build('txref', 'required:false, eg:Mc-021') 
				.end();

function service(_rave, batch_id=""){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "Bulk Transfer status"
	   })

	var d = q.defer();

	q.fcall( () => {

		var validated = morx.validate(spec, _rave.MORX_DEFAULT);
        var params = validated.params; 
        _rave.params = params
        return _rave
	})
	.then( _rave  => {
		 
        _rave.params.seckey = _rave.getSecretKey(); 
        _rave.params.batch_id = batch_id; 
		_rave.params.method = "GET"; 
        return _rave.request('v2/gpx/transfers', _rave.params)
        
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
