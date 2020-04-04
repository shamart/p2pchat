// import {api, rpc} from "../utils/eos";
const {api, rpc} = require("../utils/eos");


async function fetchSession() {
    return rpc.get_table_rows({
        json: true,
        code: 'jeffjeff2121',
        scope: 'jeffjeff2121',
        table: 'session'
    })
}

async function from(key, from) {
    return api.transact({
        actions: [{
            account: 'jeffjeff2121',
            name: 'from',
            authorization: [{
                actor: 'jeffjeff2121',
                permission: 'active',
            }],
            data: {
                key: key,
                from: from,
            },
        }]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
    });
}

async function to(key, to) {
    return api.transact({
        actions: [{
            account: 'jeffjeff2121',
            name: 'to',
            authorization: [{
                actor: 'jeffjeff2121',
                permission: 'active',
            }],
            data: {
                key: key,
                to: to,
            },
        }]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
    })

}

module.exports = {
    fetchSession,
    from,
    to
}