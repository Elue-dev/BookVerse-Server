var morx = require('morx');
const package = require('../package.json');
var q = require('q');
const axios = require('axios');


var spec = morx.spec()
    .build('seckey', 'required:true, eg:FLWSECK_TEST-9e54889bc262062ffg6654a96152ce4f477f9-X')
    .build('from', 'required:false, eg:2019:01:01')
    .build('to', 'required:false, eg:2019:01:01')
    .build('page', 'required:false, eg:20')
    .build('subaccountid', 'required:false, eg:RS_F1EC5985C24D4SDHHFF88G72D3D')

    .end();

function service(data, _rave) {
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "List all Settlements"
	   })

    var d = q.defer();

    q.fcall(() => {

            var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
            var params = validated.params;


            return params;


        })
        .then(params => {

            // console.log(params)



            params.secret_key = _rave.getSecretKey();
            params.method = "GET";
            return _rave.request('/v2/merchant/settlements', params)
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


