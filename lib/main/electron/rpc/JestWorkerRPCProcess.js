"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JestWorkerRPCProcess = void 0;
const RPCProcess_1 = require("../../rpc/RPCProcess");
class JestWorkerRPCProcess extends RPCProcess_1.RPCProcess {
    initializeRemote() {
        return {
            runTest: this.jsonRPCCall.bind(this, "runTest"),
            shutDown: this.jsonRPCCall.bind(this, "shutDown")
        };
    }
}
exports.JestWorkerRPCProcess = JestWorkerRPCProcess;
//# sourceMappingURL=JestWorkerRPCProcess.js.map