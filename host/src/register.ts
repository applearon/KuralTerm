import { WebSocket } from 'ws';
require('dotenv').config();
let url = process.env.URL;
let port = process.env.PORT;
let username = process.env.USERNAME;
let password = process.env.PASSWORD;
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
const socket = new WebSocket(`ws://${url}:3000`);

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