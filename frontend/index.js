import { Terminal } from 'xterm';
var term = new Terminal({
    cols: 80,
    rows: 24,
});
term.open(document.getElementById('terminal'));
term.write('Hello gamers from \x1B[1;3;31mxterm.js\x1B[0m $ ');
console.log("Hello via Bun!");