import { WebSocket } from 'ws';
require('dotenv').config();
let url = process.env.KURL;
let port = process.env.KPORT;
let username = process.env.KUSERNAME;
let password = process.env.KPASSWORD;
if (username === undefined || password === undefined) {
  console.log("Set the host $USERNAME and $PASSWORD in your .env:");
  console.log("export USERNAME=myusername");
  console.log("export PASSWORD=mypassword");
};
if (url === undefined) {
  url = 'localhost'; // default value
}
if (port === undefined) {
  port = '3000'; // default value
}
const socket = new WebSocket(`wss://${url}:${port}`);

// set username and password in .env
let init = {"action": "host", "payload": {"action": "init", "payload": {"username": username, "password": password}}}

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