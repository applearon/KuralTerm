import { WebSocket } from 'ws';
import { spawn } from 'node-pty';
require('dotenv').config();

interface WSMessage { // all Websocket messages use the interface WSMessage
  action: string, // "client"/"host" for incoming
  payload: string & WSResize,
}
interface WSResize {
  x: number,
  y: number,
}

let username = process.env.KUSERNAME;
let password = process.env.KPASSWORD;
let shell = process.env.KSHELL;
let url = process.env.KURL;
let port = process.env.KPORT;
let socket: WebSocket;
let reconnectInterval = 500; // reconnect after 0.5 sec
if (url === undefined) {
  url = 'localhost'; // default value
}
if (port === undefined) {
  port = '3000'; // default value
}
if (shell === undefined) {
  shell = '/bin/bash';
}
if (username === undefined || password === undefined) {
  console.log("Set the host username and password in your .env");
  console.log("export KUSERNAME=myusername");
  console.log("export KPASSWORD=mypassword");
  console.log("if you haven't done so already, register an account using register.js");
  process.abort();
}
let login = { "action": "host", "payload": { "action": "login", "payload": { "username": username, "password": password } } }
let connect = function(){
socket = new WebSocket(`wss://${url}:${port}`);
let myenvs = {"KURALTERM": "1"};
let testenv = Object.assign({},
  process.env,
  myenvs,
  )
// Connection opened
socket.addEventListener("open", (event) => {
  socket.send(JSON.stringify(login));
});
let pty = spawn(shell!, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 24,
  cwd: process.env.HOME,
  env: process.env,
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
pty.onExit((data) => { // should restart term on exit
  console.log("terminal died :(");
  socket.close(); // Force to restart connection, slightly scuffed but should work
})

socket.addEventListener("message", (event) => {
  let data: WSMessage = JSON.parse(event.data.toString());
  console.log(event.data);
  switch (data.action) {
    case "result": {
      console.log(data.payload);
    }; break
    case "login": {
      console.log(data.payload);
      pty.write('\x03 clear\n');
    }; break
    case "data": {
      pty.write(data.payload);

    }; break
    case "resize": {
      pty.resize(data.payload.y, data.payload.x);
      console.log("resize!");
    }; break
  }

});
socket.addEventListener("close", (event) => {
  setTimeout(connect, reconnectInterval)
  console.log("restarted connection");
})
}
console.log('hello');
connect();