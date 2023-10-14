import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
require('dotenv').config();

let url = process.env.URL; // Change for bastion host IP
let port = process.env.PORT;
let socket;
let reconnectInterval = 500; // reset websocket connection after 0.5sec
if (port === undefined) {
    port = 3000; // default port
}
if (url === undefined) {
    url = 'localhost'; // default URL
}
let term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
console.log(term.cols, term.rows);
term.write('Hello gamers from \x1B[1;3;31mxterm.js\x1B[0m $ ');
console.log("Hello via Bun!");

let connect = function(){
let ServerStatus = document.getElementById("serverStats");
// {"action": "host", "payload": {"action": "login", "payload": {"username": "BSSCC", "password": Bun.env.HOSTPW}}}
socket = new WebSocket(`wss://${url}:${port}`);
function loginAttempt(login) {
    
    console.log("hi")
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let res = { "action": "client", "payload": { "action": "login", "payload": { "username": username, "password": password } } }
    socket.send(JSON.stringify(res));
    login.preventDefault();
    fitAddon.fit();
}
term.onBell(undefined => {
    console.log('bell')
})
term.onBinary(data => {
    let input = { "action": "client", "payload": { "action": "data", "payload": data } }
    socket.send(JSON.stringify(input))
})
term.onData(data => {
    let input = { "action": "client", "payload": { "action": "data", "payload": data } }
    socket.send(JSON.stringify(input))
    // term.write(data);
});
term.onResize(data => {
    let input = {"action": "client", "payload": {"action": "resize", "payload": {"x": data.cols, "y": data.rows}}};
    socket.send(JSON.stringify(input));
    console.log("resize!");

})
const form = document.getElementById("login");
form.addEventListener("submit", loginAttempt);
socket.addEventListener("message", (event) => {
    let data = event.data.toString();
    if (JSON.parse(data).action === "result") {
        // term.write(JSON.parse(data).payload.payload);
        ServerStatus.innerText = JSON.parse(data).payload.payload
    } else if (JSON.parse(data).action === "host") {
        // term.selectAll();
        // term.clear()
        term.write(JSON.parse(data).payload);
        // term.writeln();
        // console.log(JSON.parse(data).payload);
        // term.write('\n')
    }
});
socket.addEventListener("close", (event) => {
    console.log("connection closed :(");
    setTimeout(connect, reconnectInterval)
})
};
connect();