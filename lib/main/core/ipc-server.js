"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const tslib_1 = require("tslib");
const ipc = tslib_1.__importStar(require("node-ipc"));
let started = false;
const startServer = ({ serverID }) => {
    if (started) {
        throw new Error("IPC server can only be started once");
    }
    return new Promise(resolve => {
        started = true;
        ipc.config.id = serverID;
        ipc.config.retry = 1500;
        ipc.config.silent = true;
        ipc.serve(() => {
            resolve(ipc.server);
        });
        ipc.server.start();
    });
};
exports.startServer = startServer;
//# sourceMappingURL=ipc-server.js.map