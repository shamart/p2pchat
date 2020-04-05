#!/usr/bin/env node
const dgram = require('dgram');
const ip = require('ip');

const localhost = ip.address();

// based on http://www.bford.info/pub/net/p2pnat/index.html


const socket = dgram.createSocket('udp4');
socket.bind(6666, localhost);

let publicEndpointA = null;
let publicEndpointB = null;

socket.on('listening', function () {
    console.log('UDP Server listening on ' + socket.address().address + ":" + socket.address().port);
});

socket.on('message', function (message, remote) {
    const parse = JSON.parse(`${message}`);
    console.log("message:" + remote.address + ':' + remote.port + ' - ' + message);
    if (parse.type === 'fetchIp') {
        const addr = remote.address + ":" + remote.port;
        const msg = JSON.stringify({
            type: 'fetchIpAns',
            body: addr
        });
        socket.send(msg, 0, msg.length, remote.port, remote.address, function (error) {
            if (error) {
                console.log(error)
            }
        });
    }

    // if (message === 'B') {
    //     publicEndpointB = {
    //         name: 'B',
    //         address: remote.address,
    //         port: remote.port
    //     }
    // }
    //
    // sendPublicDataToClients();
});


function sendPublicDataToClients() {
    if (publicEndpointA && publicEndpointB) {

        const messageForA = new Buffer(JSON.stringify(publicEndpointB));
        socket.send(messageForA, 0, messageForA.length, publicEndpointA.port, publicEndpointA.address, function (err, nrOfBytesSent) {
            if (err) return console.log(err);
            console.log('> public endpoint of B sent to A');
        });

        const messageForB = new Buffer(JSON.stringify(publicEndpointA));
        socket.send(messageForB, 0, messageForB.length, publicEndpointB.port, publicEndpointB.address, function (err, nrOfBytesSent) {
            if (err) return console.log(err);
            console.log('> public endpoint of A sent to B');
        });

    }
}







