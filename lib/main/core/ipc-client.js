"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToIPCServer = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const ipc = tslib_1.__importStar(require("node-ipc"));
let connected = false;
const connectToIPCServer = ({ serverID, workerID }) => {
    if (connected) {
        throw new Error("can't connect to IPC server more than once from one worker");
    }
    connected = true;
    ipc.config.id = serverID;
    ipc.config.silent = true;
    ipc.config.retry = 1500;
    return new Promise(resolve => {
        const onMessageCallbacks = [];
        ipc.connectTo(serverID, () => {
            ipc.of[serverID].on("connect", () => {
                const initMessage = (0, utils_1.makeMessage)({
                    messageType: utils_1.MessageType.INITIALIZE
                });
                ipc.of[serverID].emit(workerID, initMessage);
            });
            ipc.of[serverID].on(workerID, (data) => {
                onMessageCallbacks.forEach(cb => cb(data));
            });
            resolve({
                send: message => ipc.of[serverID].emit(workerID, message),
                onMessage: fn => {
                    onMessageCallbacks.push(fn);
                },
                disconnect: () => ipc.disconnect(workerID)
            });
        });
    });
};
exports.connectToIPCServer = connectToIPCServer;
//# sourceMappingURL=ipc-client.js.map