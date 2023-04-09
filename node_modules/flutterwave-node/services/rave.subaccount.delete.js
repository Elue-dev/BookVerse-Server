var morx = require('morx');
var charge = require('./rave.charge');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');

var spec =  morx.spec()
                .build('id', 'required:true')
                .end();
                

function service(data, _rave){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Delete a Subaccount"
       })

	var d = q.defer();
	q.fcall( () => {

		var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
		var params = validated.params;


            return params;
    })
    .then((params) => {
		params.seckey = _rave.getSecretKey();  
		return _rave.request('v2/gpx/subaccounts/delete', params)
	})
	.then( resp => {

		d.resolve(resp.body);

	})
	.catch( err => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;

