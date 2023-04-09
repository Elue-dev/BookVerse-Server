var morx = require('morx');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');

//This allows you retrieve all retires for a single transfer

var spec = morx.spec()


    .build('id', 'required:true')

    .end();

function service(data, _rave) {
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Fetch Transfer retries"
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
            
            return _rave.request(`/v2/gpx/transfers/${params.id}/retries`, params)
        })
        .then(response => {
            d.resolve(response.body);

        })
        .catch(err => {

            d.reject(err);

        })

    return d.promise;



}
service.morxspc = spec;
module.exports = service;

