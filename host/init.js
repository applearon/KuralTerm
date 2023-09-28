"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
require('dotenv').config();
var url = process.env.URL; // Change bastion host IP in .env
var socket = new ws_1.WebSocket("ws://".concat(url, ":3000"));
// set username and password in .env
var init = { "action": "host", "payload": { "action": "init", "payload": { "username": process.env.HOSTUSER, "password": process.env.HOSTPW } } };
socket.addEventListener("open", function (event) {
    socket.send(JSON.stringify(init));
});
socket.addEventListener("message", function (event) {
    var data = event.data.toString();
    if (JSON.parse(data).action === "result") {
        console.log("response:");
        console.log(JSON.parse(data).payload);
    }
});
