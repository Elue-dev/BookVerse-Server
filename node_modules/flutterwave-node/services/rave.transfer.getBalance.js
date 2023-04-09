var morx = require('morx');
var q = require('q');
const axios = require('axios');
const package = require('../package.json');

//This helps you get your balance for transfers

var spec =  morx.spec()
                .build('currency', 'required:true')
                .end();


function service(data, _rave){
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "Get Transfer Balance"
	   })

    var d = q.defer();
    q.fcall( () => {

        var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
        var params = validated.params;
        return  (params);

    })
    .then((params) => {
        params.secret_key = _rave.getSecretKey(); 
        params.method = "POST";
        return _rave.request('v2/gpx/balance', params)
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

