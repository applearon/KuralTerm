#!/usr/bin/env -S bun --watch
import { v4 as uuidv4 } from 'uuid';
import { ServerWebSocket } from 'bun';
import { Client } from 'pg';
console.log("Starting \"Bastion\" server");
const client = new Client();
try {
    await client.connect();
} catch (err) {
    console.log(err)
    console.log("Could not connect to Postgres server. Check Postgresdb status, or credentials in .env");
    process.abort();
}

interface WSServerData { // for ServerWebSocket
    uuid: string,
}
interface WSMessage { // all Websocket messages use the interface WSMessage
    action: string, // "client"/"host" for incoming
    payload: WSClient & WSHost & WSResponse & string,
}
interface WSClient {
    action: string,
    payload: WSlogin
}

// Host Socket Responses
interface WSHost {
    action: string,
    payload: WSInit,
}

interface WSInit {
    username: string,
    password: string,
}

interface WSResponse { // Server response
    forAction: string,
    result: boolean,
    payload: string,
}
interface WSlogin {
    key: string
}
interface UserState {
    username: string,
    ws: ServerWebSocket<WSServerData>,
}

const currentHosts = new Map<string, UserState>; // uuid: UserState
const currentClients = new Map<string, UserState>; // uuid: UserState

function getConnectedAccs(username: string) { // returns an array of userStates connected to some user
    let users: UserState[] = [];
    for (let [key, value] of currentClients) {
        if (value.username === username) {
            users.push(value);
            // console.log(room);
        }
    }
    return users;
}
// Function redirects data from the host to all connected users
function hostBroadcast(data: WSHost, username: string) {
    let users = getConnectedAccs(username);
    for (let user of users) {
        user.ws.send(JSON.stringify(data));
    }
}

function getUUID(map: Map<string, UserState>, username: string) {
    for (let [key, value] of map.entries()) {
        if (value.username === username)
            return key;
    }
    return undefined;
}

Bun.serve({
    fetch(req, server) {
        if (server.upgrade(req, {
            data: {
                uuid: uuidv4(),
            },
        })) {
            console.log("connection:", req.headers.get("host"));
        }
        return new Response('try a websocket');
    },
    port: 3000,
    websocket: {
        async message(ws: ServerWebSocket<WSServerData>, message) {
            let msg: WSMessage = JSON.parse(message.toString());
            switch (msg.action) {
                case "client": {
                    let info = msg.payload;
                    switch (info.action) {
                        case "login": {
                            const key = new Bun.CryptoHasher("blake2b256");
                            let username = info.payload.username;
                            key.update(info.payload.password);
                            let password = key.digest()
                            let hostActive = getUUID(currentHosts, info.payload.username);
                            let corPasswd = (await client.query('SELECT password FROM hosts WHERE username = $1', [username])).rows[0]
                            if (corPasswd?.password === password) {
                                if (hostActive !== undefined) { // user has logged in
                                    currentClients.set(ws.data.uuid, { username: info.payload.username, ws: ws } as UserState);
                                    ws.send(JSON.stringify({
                                        action: "result",
                                        payload: {
                                            forAction: "login",
                                            result: true,
                                            payload: "successfully logged in!"
                                        } as WSResponse
                                    } as WSMessage))

                                    // Tell host that user logged in
                                    let wshost = currentHosts.get(hostActive)?.ws;
                                    wshost?.send(JSON.stringify({
                                        action: "login",
                                        payload: "new user logged in"
                                    } as WSMessage))
                                } else {
                                    ws.send(JSON.stringify({
                                        action: "result",
                                        payload: {
                                            forAction: "login",
                                            result: false,
                                            payload: "Host appears to be offline. Try again later"
                                        } as WSResponse
                                    } as WSMessage))
                                }
                            } else {
                                ws.send(JSON.stringify({
                                    action: "result",
                                    payload: {
                                        forAction: "login",
                                        result: false,
                                        payload: "Failed to log in. Incorrect username/password"
                                    } as WSResponse
                                } as WSMessage))
                            }
                            // console.log(corPasswd)
                        }; break
                        case "data": {
                            if (currentClients.get(ws.data.uuid)) { // user is logged in
                                // console.log(info);
                                let hostActive = getUUID(currentHosts, currentClients.get(ws.data.uuid)?.username!);
                                currentHosts.get(hostActive!)?.ws.send(JSON.stringify(info));
                            }
                        }
                    }
                } break;
                case "host": {
                    let info: WSHost = msg.payload;
                    // set hash
                    const key = new Bun.CryptoHasher("blake2b256");
                    switch (info.action) {
                        case "init": {
                            let userExists = (await client.query('SELECT * FROM hosts WHERE username = $1', [info.payload.username])).rows[0];
                            console.log("userexists" + userExists);
                            if (userExists !== undefined) { // if the user existsc
                                ws.send(JSON.stringify({
                                    action: "result",
                                    payload: {
                                        forAction: "init",
                                        result: false,
                                        payload: "user already exists, change username"
                                    } as WSResponse
                                } as WSMessage))
                            } else { // user does not exist yet,
                                key.update(info.payload.password)
                                let passwd = key.digest();
                                await client.query('INSERT INTO hosts(username, password) VALUES($1, $2)', [info.payload.username, passwd])
                                ws.send(JSON.stringify({
                                    action: "result",
                                    payload: {
                                        forAction: "init",
                                        result: true,
                                        payload: "user sucessfully created!"
                                    } as WSResponse
                                } as WSMessage))
                            }
                            // await client.query('INSERT INTO keys(key) VALUES($1)', [key.digest().toString()])
                        }; break
                        case "login": {
                            let username = info.payload.username;
                            key.update(info.payload.password);
                            let password = key.digest();

                            let corPasswd = (await client.query('SELECT password FROM hosts WHERE username = $1', [username])).rows[0]
                            console.log(corPasswd);
                            console.log(password);
                            if (corPasswd?.password === password) {
                                currentHosts.set(ws.data.uuid, { username: info.payload.username, ws: ws } as UserState);
                                ws.send(JSON.stringify({
                                    action: "result",
                                    payload: {
                                        forAction: "login",
                                        result: true,
                                        payload: "successfully logged in!"
                                    } as WSResponse
                                } as WSMessage))
                                console.log("host log in")
                            } else {
                                ws.send(JSON.stringify({
                                    action: "result",
                                    payload: {
                                        forAction: "login",
                                        result: false,
                                        payload: "Failed to log in. Incorrect username/password"
                                    } as WSResponse
                                } as WSMessage))
                                console.log("failed login")
                            }
                            // console.log(corPasswd)
                        } break;
                        case "host": {
                            let host: UserState | undefined = currentHosts.get(ws.data.uuid)
                            if (host !== undefined) { // is used logged in
                                // let client = currentClients.get(getUUID(currentClients, host.username)!);
                                hostBroadcast(info, host.username);
                            }
                        } break;
                    }
                } break;
                default: {
                    ws.send(JSON.stringify({
                        action: "result",
                        payload: {
                            forAction: "any",
                            result: false,
                            payload: "specify \"action\" as either client or host"
                        } as WSResponse
                    } as WSMessage))
                }
            }
        },
        close(ws) {
            console.log(ws.data.uuid + " disconnected");

            if (currentHosts.get(ws.data.uuid)) {
                currentHosts.delete(ws.data.uuid);
            } else if (currentClients.get(ws.data.uuid)) {
                currentClients.delete(ws.data.uuid);
            }
        }
    }

})