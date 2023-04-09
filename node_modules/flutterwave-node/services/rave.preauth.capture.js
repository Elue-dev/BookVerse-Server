var morx = require('morx');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');

var spec = morx.spec()
                .build('flwRef', 'required:true, eg:FLW002983839')
                .end();


function service(data, _rave) {
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Preauth capture"
       })

    var d = q.defer();

    q.fcall(() => {
        var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
        var params = validated.params;

        return params;
    })
    .then(params => {
        params.SECKEY = _rave.getSecretKey();
    
        return _rave.request('/flwv3-pug/getpaidx/api/capture', params);
    })
    .then(resp => {
        d.resolve(resp);
    })
    .catch(err => {
        d.reject(err);
    });

    return d.promise;
}

service.morxspc = spec;
module.exports = service;