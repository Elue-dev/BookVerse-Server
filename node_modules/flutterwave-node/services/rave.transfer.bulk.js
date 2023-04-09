var morx = require('morx');
const package = require('../package.json');
var charge = require('./rave.charge');
var q = require('q');
const axios = require('axios');


//This allows you send bulk transfers

var spec =  morx.spec()
                .build('bulk_data', 'required:true, eg:{ "Bank":"044","Account Number":"0690000032"},{"Bank":"044","Account Number":"0690000032"}')
                .end();


function service(data, _rave){

    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs v2",
		 "version": package.version,
		 "title": "Incoming call",
		     "message": "Initiate Bulk Transfer"
	   })
    

    var d = q.defer();
    q.fcall( () => {

        var validated = morx.validate(data, spec, _rave.MORX_DEFAULT);
        var params = validated.params;
        // console.log(params)
        // params.country = params.country || "NG";
        _rave.params = params
        return  (_rave);

    })
    .then((_rave) => {
        _rave.params.seckey = _rave.getSecretKey();  
        return _rave.request('v2/gpx/transfers/create_bulk', _rave.params)
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

