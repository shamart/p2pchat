const {fetchSession} = require("./api/eos");
const readline = require('readline');
const {from} = require("./api/eos");
const dgram = require('dgram');
const ip = require('ip');
const {to} = require("./api/eos");

const socket = dgram.createSocket('udp4');
// const localhost = ip.address();
const localHost = '192.168.0.41';
const localPort = 6668;
const serverHost = '192.168.0.41';
const serverPort = 6666;

socket.bind(localPort, localHost);
let localPublicAddr;
let fromAddrs;

const shakeHandler = setInterval(function () {
    if (fromAddrs) {
        for (const fromAddr of fromAddrs) {
            console.log("send shake to " + fromAddr)
            const [host, port] = fromAddr.split(':');
            socket.send(JSON.stringify({
                type: 'shake'
            }), port, host, function (e) {
                if (e) {
                    console.log(e)
                }
            })
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
    if (msg.type === 'fetchIpAns') {
        localPublicAddr = msg.body;
    } else if (type === 'shake') {

    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('channel number?');
rl.setPrompt('?> ');
rl.prompt();


let stat = 'offline';


rl.on("line", async function (line) {
    if (stat === 'offline') {
        const number = parseInt(line);
        if (isNaN(number)) {
            throw 'invalid number'
        }
        stat = 'connecting';
        const session = await fetchSession();
        const find = session.rows.find(x => x.key === number);
        if (!find) {
            throw 'non-exist channel';
        }
        fromAddrs = JSON.parse(find.from);
        const handler = setInterval(async function () {
            if (localPublicAddr) {
                clearInterval(handler);
                rl.setPrompt(number + '> ');
                rl.prompt();
                console.log('local public ip ' + localPublicAddr);
                const localPrivateAddr = `${localHost}:${localPort}`;
                const addr = [localPublicAddr];
                if (localPrivateAddr !== localPublicAddr) {
                    addr.push(localPrivateAddr);
                }
                await to(number, JSON.stringify(addr));
                stat = 'shake';
            }
        }, 500);
    } else if (stat === 'connected') {
        if (line) {
        }
    }
});

process.on('unhandledRejection', (reason, p) => {
    console.log(reason);
    process.exit(-1);
});
