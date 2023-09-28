"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var socket = new ws_1.WebSocket("ws://localhost:3000");
var node_pty_1 = require("node-pty");
var login = { "action": "host", "payload": { "action": "login", "payload": { "username": "BSSCC", "password": process.env.HOSTPW } } };
// Connection opened
socket.addEventListener("open", function (event) {
    socket.send(JSON.stringify(login));
});
var pty = (0, node_pty_1.spawn)('/bin/bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
});
pty.onData(function (data) {
    process.stdout.write(data);
    console.log('output');
    var termstuff = { "action": "host", "payload": { "action": "host", "payload": data } };
    socket.send(JSON.stringify(termstuff));
});
socket.addEventListener("message", function (event) {
    var data = event.data.toString();
    if (JSON.parse(data).action === "result") {
        console.log(JSON.parse(data));
    }
    if (JSON.parse(data).action === "login") {
        // ls.stdin.write('echo henlo\n')
        console.log(JSON.parse(data));
    }
    else if (JSON.parse(data).action === "data") {
        //   if (JSON.parse(data).payload === '\r') {
        //     pty.write('\n');
        //     console.log('owo')
        //   } else {
        pty.write(JSON.parse(data).payload);
        console.log(JSON.parse(data).payload);
    } //}
});
console.log('hello');
