"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCProcess = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const node_ipc_1 = tslib_1.__importDefault(require("node-ipc"));
const path = tslib_1.__importStar(require("path"));
const utils_1 = require("../core/utils");
const constants_1 = require("./constants");
const jsonrpc_1 = require("./jsonrpc");
class RPCProcess {
    constructor(spawn) {
        this.socket = null;
        this.serverID = (0, utils_1.makeUniqServerId)();
        this.isAlive = false;
        this.ipc = new node_ipc_1.default.IPC();
        this.spawnFn = spawn instanceof Function ? spawn : makeSpawnNodeFn(this.serverID, spawn);
        this.remote = this.initializeRemote();
        this.pendingRequests = {};
    }
    initializeRemote() {
        throw new Error("not implemented");
    }
    async start() {
        this.ipc.config.id = this.serverID;
        this.ipc.config.retry = 1500;
        this.ipc.config.silent = true;
        this.subProcess = this.spawnFn({ serverID: this.serverID });
        const socket = await new Promise(resolve => {
            this.ipc.serve(() => {
                this.ipc.server.on(constants_1.INITIALIZE_MESSAGE, (message, socket) => {
                    this.server = this.ipc.server;
                    this.isAlive = true;
                    resolve(socket);
                });
                this.ipc.server.on(constants_1.JSONRPC_EVENT_NAME, (json) => {
                    this.handleJsonRPCResponse(json);
                });
            });
            this.ipc.server.start();
        });
        this.socket = socket;
    }
    stop() {
        this.server?.stop();
        if (this.subProcess != null && this.isAlive && this.subProcess.pid != null) {
            try {
                // Kill whole process group with negative PID (See `man kill`)
                process.kill(-this.subProcess.pid, "SIGKILL");
            }
            catch (e) {
                // Ignored
            }
        }
        this.subProcess?.kill("SIGKILL");
        delete this.server;
        this.isAlive = false;
    }
    async jsonRPCCall(method, ...args) {
        this.ensureServerStarted();
        return new Promise((resolve, reject) => {
            const { id, json } = (0, jsonrpc_1.serializeRequest)(method, [...args]);
            if (this.socket != null) {
                this.server?.emit(this.socket, constants_1.JSONRPC_EVENT_NAME, json);
            }
            this.pendingRequests[id] = {
                resolve: data => {
                    delete this.pendingRequests[id];
                    resolve(data);
                },
                reject: error => {
                    delete this.pendingRequests[id];
                    reject(new Error(`${error.code}:${error.message}\n${error.data}`));
                }
            };
        });
    }
    handleJsonRPCResponse(json) {
        const response = (0, jsonrpc_1.parseResponse)(json);
        const { id, result, error } = response;
        if (error != null) {
            this.pendingRequests[id].reject(error);
        }
        else {
            this.pendingRequests[id].resolve(result);
        }
    }
    ensureServerStarted() {
        if (this.server == null) {
            throw new Error("RPCProcess need to be started before making any RPC calls");
        }
    }
}
exports.RPCProcess = RPCProcess;
const getBabelNodeBin = () => path.resolve(__dirname, "../../../node_modules/.bin/babel-node");
function makeSpawnNodeFn(serverID, { initFile, useBabel }) {
    return () => {
        const bin = useBabel === true ? getBabelNodeBin() : "node";
        return (0, child_process_1.spawn)(bin, [initFile], {
            stdio: ["inherit", process.stderr, "inherit"],
            env: {
                ...process.env,
                JEST_SERVER_ID: serverID
            },
            detached: true
        });
    };
}
//# sourceMappingURL=RPCProcess.js.map