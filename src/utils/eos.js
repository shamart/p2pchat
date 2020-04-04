// import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');
const {Api, JsonRpc} = require('eosjs');
// import {Api, JsonRpc} from "eosjs";
// import fetch from 'fetch'
// const fetch = require('fetch');
const fetch = require('node-fetch');


const defaultPrivateKey = "5KXF1HFev99iY24mSxLCfTfKLd8ByE9FPgZmyoBhtTX8UHu2z6H"; // jeffjeff2121
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const rpc = new JsonRpc('http://jungle2.cryptolions.io:8888', {fetch});
const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});

module.exports = {
    rpc,
    api
};
// export {
//     rpc,
//     api
// }