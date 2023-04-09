var morx = require('morx');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');

var spec = morx.spec()
                .build('id', 'required:false,validators:isNumeric, eg:7345')
                .build('ref', 'required:false, eg:7345')
                .build('amount', 'required:false, eg:100')
				.build('action', 'required:false, eg:void')
                .end();
                
function service(data, _rave) {
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Preauth void"
       })

    var d = q.defer();

        q.fcall(() => {
            var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
            var params = validated.params;

            params.action = params.action || 'void';

            return params;
        })
        .then(params => {
            params.SECKEY = _rave.getSecretKey();
            return _rave.request('/flwv3-pug/getpaidx/api/refundorvoid', params);
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