import { Terminal } from 'xterm';
require('dotenv').config();

let url = process.env.URL; // Change for bastion host IP
let port = process.env.PORT;
if (port === undefined) {
    port = 3000; // default port
}
if (url === undefined) {
    url = 'localhost'; // default URL
}
const socket = new WebSocket(`ws://${url}:${port}`);
var term = new Terminal({
    cols: 80,
    rows: 24,
});
term.open(document.getElementById('terminal'));
term.write('Hello gamers from \x1B[1;3;31mxterm.js\x1B[0m $ ');
console.log("Hello via Bun!");
let ServerStatus = document.getElementById("serverStats");
// {"action": "host", "payload": {"action": "login", "payload": {"username": "BSSCC", "password": Bun.env.HOSTPW}}}

function loginAttempt(login) {
    console.log("hi")
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let res = { "action": "client", "payload": { "action": "login", "payload": { "username": username, "password": password } } }
    socket.send(JSON.stringify(res));
    login.preventDefault();
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
        console.log(JSON.parse(data).payload);
        // term.write('\n')
    }
});