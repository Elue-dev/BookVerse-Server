var Rave = require('./');
var request = require('request');

var rave = new Rave('FLWPUBK-8cd258c49f38e05292e5472b2b15906e-X', 'FLWSECK-c51891678d48c39eff3701ff686bdb69-X', false);

var payload = {
    "ref": "FLW-MOCK-f129ce9ac1fe993091795ce08c43fb9b",
    "seckey": "FLWSECK-e6db11d1f8a6208de8cb2f94e293450e-X"
}

var payload2 = {
    "flw_ref": "FLW00857736",
    "last_attempt": "1",
    "only_successful": "1"
}

var payload3 = {
    "cardno": "4999082100029373",
    "cvv": "890",
    "expirymonth": "8",
    "expiryyear": "2019",
    "currency": "NGN",
    "country": "NG",
    "charge_type": "preauth",
    "amount": "10",
    "email": "bablu.mailing@example.com",
    "phonenumber": "1234555",
    "firstname": "babloo",
    "lastname": "jj",
    "IP": "117.240.189.202",
    "txRef": "MC-5345-HVF",
    "device_fingerprint": "69e6b7f0b72037aa8428b70fbe03986c"
}

// rave.Status.xrequery(payload2).then(resp => {
//     console.log("---resp---: ", resp.body);
// })
// .catch(err => {
//     console.log("---err---: ", err);
// })

rave.CustomRequest.custom('/gpx/merchant/transactions/refund', payload)
                    .then( resp => {
                        console.log("this is the response: ", resp);
                    })
                    .catch(err => {
                        console.log("this is the error: ", err)
                    })


// rave.Preauth.preauth(payload3).then(resp => {
//     console.log('this is response....', resp.body);
// })
// .catch(err => {
//     console.log('this is error... ', err);
// })