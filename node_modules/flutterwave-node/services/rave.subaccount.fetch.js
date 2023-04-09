var morx = require('morx');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');

var spec =  morx.spec()  
				.build('id', 'required:true')  
				.end();

function service(data,_rave){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Fetch a Subaccount"
       })

	var d = q.defer();

	q.fcall( () => {

		var validated = morx.validate(data,spec, _rave.MORX_DEFAULT);
        var params = validated.params;


            return params;

	})
	.then( params  => {
		 
        params.seckey = _rave.getSecretKey(); 
        // console.log(_rave.params.seckey)
        params.method = "GET"; 
        var uri = 'v2/gpx/subaccounts/get/' + params.id
		return _rave.request(uri, params)
		
        
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

