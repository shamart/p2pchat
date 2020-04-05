const readline = require('readline');
const {from} = require("./api/eos");
const dgram = require('dgram');
const ip = require('ip');
const {fetchSession} = require("./api/eos");

const socket = dgram.createSocket('udp4');
const localHost = ip.address();
// const localHost = '192.168.0.41';
const localPort = 6667;
const serverHost = '192.168.0.41';
const serverPort = 6666;

socket.bind(localPort, localHost);

let stat = 'offline';
let localPublicAddr;
let toAddrs;
let oldToAddrs;
let addr2handler = new Map();
let availableTo = [];
setInterval(function () {
    if (JSON.stringify(oldToAddrs) !== JSON.stringify(toAddrs)) {
        oldToAddrs = toAddrs;

        for (const toAddr of toAddrs) {
            const handler = setInterval(function () {
                // console.log("send shake to " + toAddr);
                const [host, port] = toAddr.split(':');
                socket.send(JSON.stringify({
                    type: 'shake',
                    body: toAddr
                }), port, host, function (e) {
                    if (e) {
                        console.log(e)
                    }
                })
            }, 500);
            addr2handler.set(toAddr, handler);
        }
    }
}, 500);


const msg = JSON.stringify({
    type: "fetchIp"
});

socket.send(msg, 0, msg.length, serverPort, serverHost, function (error, bytes) {
    if (error) {
        console.log(error)
    }
});

socket.on("message", function (message, remote) {
    const msg = JSON.parse(`${message}`);
    const type = msg.type;
    if (type === 'fetchIpAns') {
        localPublicAddr = msg.body;
    } else if (type === 'shakeAns') {
        const handler = addr2handler.get(msg.body);
        // console.log('shakeAns, clear handler, ip:' + msg.body)
        clearInterval(handler);
        const find = availableTo.find(x => x === msg.body);
        if (!find) {
            availableTo.push(msg.body);

        }
    } else if (type === 'shake') {
        socket.send(JSON.stringify({
            type: 'shakeAns',
            body: msg.body
        }), remote.port, remote.address, function (e) {
            if (e) {
                console.log(e);
            }
        })
    }else if (type === 'chat') {
        console.log('[receiver] ' + msg.body);
        rl.prompt();
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('channel number?');
rl.setPrompt('?> ');
rl.prompt();

const connectedHandler = setInterval(function () {
    if (availableTo.length > 0) {
        if (stat === 'shake') {
            clearInterval(connectedHandler);
            stat = 'connected';
            rl.prompt();
            console.log('connected! chat now!');
            rl.prompt();
        }
    }
}, 200);


rl.on("line", async function (line) {
    if (stat === 'offline') {
        const number = parseInt(line);
        if (isNaN(number)) {
            throw 'invalid number';
        }
        stat = 'connecting';
        const session = await fetchSession();
        const find = session.rows.find(x => x.key === number);
        if (!find) {
            throw 'non-exist channel';
        }
        if (find.to) {
            toAddrs = JSON.parse(find.to);
        }
        const handler = setInterval(async function () {
            if (localPublicAddr) {
                clearInterval(handler);
                rl.setPrompt(number + '> ');
                rl.prompt();
                console.log('fetch local ip..');
                const localPrivateAddr = `${localHost}:${localPort}`;
                const addr = [localPublicAddr];
                if (localPrivateAddr !== localPublicAddr) {
                    addr.push(localPrivateAddr);
                }
                rl.prompt();
                console.log('shake on eos..');
                await from(number, JSON.stringify(addr));
                stat = 'shake';

            }
        }, 500);
    } else if (stat === 'connected') {
        if (line) {
            const [host,port] = availableTo[0].split(':');
            socket.send(JSON.stringify({
                type: 'chat',
                body: line
            }), port, host, function (e) {
                if (e) {
                    console.log(e)
                }
            });
            rl.prompt();
        }
    }
});


process.on('unhandledRejection', (reason, p) => {
    console.log(reason);
    process.exit(-1);
});