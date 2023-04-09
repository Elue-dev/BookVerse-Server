var morx = require('morx');
var q = require('q');
const axios = require('axios');
const package = require('../package.json');

var spec = morx.spec()
    
    .build('txref', 'required:true, eg:FLW001286941')
    .end();
    

function service(data, _rave) {
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "Verify Transaction Status"
	   })

    var d = q.defer();

    q.fcall(() => {

            var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
            var params = validated.params;


            return params;


        })
        .then(params => {

            // console.log(params)



            params.SECKEY = _rave.getSecretKey();
            params.method = "POST";
            return _rave.request('/flwv3-pug/getpaidx/api/v2/verify', params)
        })
        .then(response => {

            // console.log(response);
            d.resolve(response.body);

        })
        .catch(err => {

            d.reject(err);

        })

    return d.promise;



}
service.morxspc = spec;
module.exports = service;


