var morx = require('morx');
var charge = require('./rave.charge');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');


//This allows you verify an account to transfer to

var spec =  morx.spec()
                .build('recipientaccount', 'required:required,eg:0690000034')
                .build('destbankcode', 'required:required,eg:044')
                .build('PBFPubKey', 'required:required,eg:FLWPUBK-XXXXXXXXX-X')
                .end();


function service(data, _rave){
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
         "publicKey": _rave.getPublicKey(),
         "language": "NodeJs v2",
         "version": package.version,
         "title": "Incoming call",
             "message": "Resolve Account details"
       })

    var d = q.defer();
    q.fcall( () => {

        var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
        var params = validated.params;
        _rave.params = params
        return  (_rave);

    })
    .then((_rave) => {
        _rave.params.seckey = _rave.getSecretKey();
        _rave.params.PBFPubKey = _rave.getPublicKey();
        return _rave.request('flwv3-pug/getpaidx/api/resolve_account', _rave.params);
    })
    .then( resp => {

        d.resolve(resp);

    })
    .catch( err => {

        d.reject(err);

    });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;


