var morx = require('morx');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');

var spec =  morx.spec()  
				.build('account_number', 'required:false')  
				.build('account_bank', 'required:false') 
				.build('bank_name','required:false')  
				.end();

function service(data,_rave){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "List all Subaccounts"
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
        return _rave.request('v2/gpx/subaccounts/', _rave.params)
        
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
