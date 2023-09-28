import { WebSocket } from 'ws';
require('dotenv').config();
let url = process.env.URL // Change bastion host IP in .env
const socket = new WebSocket(`ws://${url}:3000`);

// set username and password in .env
let init = {"action": "host", "payload": {"action": "init", "payload": {"username": process.env.HOSTUSER, "password": process.env.HOSTPW}}}

socket.addEventListener("open", (event) => {
    socket.send(JSON.stringify(init));
  });
  socket.addEventListener("message", (event) => {
    let data: string = event.data.toString();
    if (JSON.parse(data).action === "result") {
        console.log("response:");
        console.log(JSON.parse(data).payload);
    }
  });