# KuralTerm Host
The host connects to the main backend bastion server, and creates a pty, and sends the terminal data to each connected client/frontend.

## Installation
1. Install dependencies:
```bash
npm install
```

2. Compile the code to javascript:
```bash
npx tsc src/index.ts --outDir ./dist
```

2. Set environment variables in `.env`:
```bash
export USERNAME=myusername
export PASSWORD=mypassword
export URL=localhost
export PORT=3000
export HOSTSHELL=/bin/bash
```

3. Run the host:
```bash
node dist/index.js
```
