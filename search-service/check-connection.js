const net = require('net');
const Promise = require('bluebird');

module.exports.checkConnection = (host, port, timeout) =>
     new Promise((resolve, reject) => {
        const socket = net.createConnection(port, host, () => {
            clearTimeout(timer);
            resolve();
            socket.end();
        });
        timeout = timeout || 10000;     // default of 10 seconds
        const timer = setTimeout(() => {
            reject("timeout");
            socket.end();
        }, timeout);
        socket.on('error', err => {
            clearTimeout(timer);
            reject(err);
        });
    })

/*
// example
checkConnection("example1.com", 8080).then(function() {
    // successful
}, function(err) {
    // error
})
*/