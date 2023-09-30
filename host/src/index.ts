import { WebSocket } from 'ws';
import { spawn } from 'node-pty';
require('dotenv').config();
let username = process.env.USERNAME;
let password = process.env.PASSWORD;
let url = process.env.URL;
let port = process.env.PORT;
if (url === undefined) {
  url = 'localhost'; // default value
}
if (port === undefined) {
  port = '3000'; // default value
}
if (username === undefined || password === undefined) {
  console.log("Set the host username and password in your .env");
  console.log("export USERNAME=myusername");
  console.log("export PASSWORD=mypassword");
  console.log("if you haven't done so already, register an account using register.js");
  process.abort();
}
let login = { "action": "host", "payload": { "action": "login", "payload": { "username": username, "password": password } } }

const socket = new WebSocket(`ws://${url}:${port}`);

// Connection opened
socket.addEventListener("open", (event) => {
  socket.send(JSON.stringify(login));
});
let pty = spawn('/bin/bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 24,
  cwd: process.env.HOME,
  env: process.env
});
pty.onData((data) => {
  let termstuff = { "action": "host", "payload": { "action": "host", "payload": data } };
  try {
    socket.send(JSON.stringify(termstuff));
  } catch (err) {
    console.log(err);
    console.log("Failed to send terminal data");
  }
});

socket.addEventListener("message", (event) => {
  let data: string = event.data.toString();
  if (JSON.parse(data).action === "result") {
    console.log(JSON.parse(data).payload);
  }

  if (JSON.parse(data).action === "login") {
    console.log(JSON.parse(data))
    pty.write('\x03 clear\n'); // initial clear so all terminals are equivalent

  } else if (JSON.parse(data).action === "data") {
    pty.write(JSON.parse(data).payload);
    console.log(JSON.parse(data).payload)
  }

});
console.log('hello')