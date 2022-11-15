"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_ipc_1 = tslib_1.__importDefault(require("node-ipc"));
const utils_1 = require("../core/utils");
const constants_1 = require("./constants");
const jsonrpc_1 = require("./jsonrpc");
class RPCConnection {
    constructor(methods) {
        this.methods = methods;
        this.ipc = new node_ipc_1.default.IPC();
    }
    async connect(serverId) {
        return new Promise(resolve => {
            const serverID = serverId ?? (0, utils_1.validateIPCID)(process.env.JEST_SERVER_ID);
            this.ipc.config.id = serverID;
            this.ipc.config.silent = true;
            this.ipc.config.retry = 1500;
            this.ipc.connectTo(serverID, () => {
                this.ipc.of[serverID].on("connect", () => {
                    this.ipc.of[serverID].emit(constants_1.INITIALIZE_MESSAGE);
                });
                this.ipc.of[serverID].on(constants_1.JSONRPC_EVENT_NAME, (data) => {
                    const { method, params, id } = (0, jsonrpc_1.parseRequest)(data);
                    this.methods[method]
                        .apply(null, params)
                        .then(result => {
                        this.ipc.of[serverID].emit(constants_1.JSONRPC_EVENT_NAME, (0, jsonrpc_1.serializeResultResponse)(result, id));
                    })
                        .catch(error => {
                        this.ipc.of[serverID].emit(constants_1.JSONRPC_EVENT_NAME, (0, jsonrpc_1.serializeErrorResponse)(error, id));
                    });
                });
                resolve();
            });
        });
    }
}
exports.default = RPCConnection;
//# sourceMappingURL=RPCConnection.js.map