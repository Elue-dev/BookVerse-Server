var morx = require('morx');
var q = require('q');
const package = require('../package.json');
const axios = require('axios');

//This helps you to retry a failed transfer attempt

var spec =  morx.spec()
                .build('id', 'required:required,eg:167472')
                .end();


function service(data, _rave){
    axios.post('https://kgelfdz7mf.execute-api.us-east-1.amazonaws.com/staging/sendevent', {
		 "publicKey": _rave.getPublicKey(),
		 "language": "NodeJs",
		 "version": "1.0",
		 "title": "Incoming call",
		     "message": "Transfer Retry"
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
           return _rave.request('v2/gpx/transfers/retry', params)
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
   
    
       
       
       
       
       
       
      