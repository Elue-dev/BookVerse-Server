var morx = require('morx');
var q = require('q');
const axios = require('axios');
const package = require('../package.json');

//This allows you to initiate a transfer from one flutterwave wallet to another

var spec =  morx.spec()
                .build('amount', 'required:required, eg:10')
                .build('currency', 'required:required,eg:NGN')
                .build('merchant_id', 'required:required,eg:1547282')
                .end();
                

function service(data, _rave){
	axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "Initiate Wallet To Wallet Transfer"
	   })

	var d = q.defer();
    
    q.fcall(() => {

           var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
           var params = validated.params;
           return  (params);

    })
    .then((params) => {
        params.secret_key = _rave.getSecretKey();  
        params.method = "POST";
        return _rave.request('v2/gpx/transfers/wallet', params)
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

