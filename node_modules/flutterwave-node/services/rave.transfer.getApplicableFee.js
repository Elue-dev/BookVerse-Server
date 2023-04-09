var morx = require('morx');
var q = require('q');
const axios = require('axios');
const package = require('../package.json');


//This retrieves the fee for a transfer
var spec = morx.spec()
.build('currency', 'required:true')
.build('amount', 'required:true')
.end();


function service(data,_rave){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "Get Transfer fee"
	   })


	var d = q.defer();

	q.fcall( () => {

		var validated = morx.validate(data,spec, _rave.MORX_DEFAULT);
        var params = validated.params; 
        // console.log(params)
        _rave.params = params
        return _rave

	})
	.then( _rave  => {
		 
        _rave.params.seckey = _rave.getSecretKey(); 
        // console.log(_rave.params.seckey)
		_rave.params.method = "GET"; 
        return _rave.request('v2/gpx/transfers/fee', _rave.params)
        
	})
	.then( response => {

		// console.log(response);
		d.resolve(response.body);

	})
	.catch( err => {

		d.reject(err);

	})

	return d.promise;
	
	

}
service.morxspc = spec;
module.exports = service;
