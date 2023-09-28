import { WebSocket } from 'ws';
const socket = new WebSocket("ws://localhost:3000");
import { spawn }  from 'node-pty';
let login = {"action": "host", "payload": {"action": "login", "payload": {"username": "BSSCC", "password": process.env.HOSTPW}}}

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
    console.log('output')
    let termstuff = {"action": "host", "payload": {"action": "host", "payload": data}};
    socket.send(JSON.stringify(termstuff));  
  });

socket.addEventListener("message", (event) => {
    let data: string = event.data.toString();
    if(JSON.parse(data).action === "result") {
        console.log(JSON.parse(data).payload);
    }
    
    if (JSON.parse(data).action === "login") {
        // ls.stdin.write('echo henlo\n')
        console.log(JSON.parse(data))
        
    } else if (JSON.parse(data).action === "data") {
    //   if (JSON.parse(data).payload === '\r') {
    //     pty.write('\n');
    //     console.log('owo')
    //   } else {
      pty.write(JSON.parse(data).payload);
      console.log(JSON.parse(data).payload)
    } //}

  });
console.log('hello')