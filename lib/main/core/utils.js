"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFailureTestResult = exports.parseMessage = exports.makeMessage = exports.parseJSON = exports.MESSAGE_TYPES = exports.MessageType = exports.getIPCIDs = exports.validateIPCID = exports.makeUniqWorkerId = exports.makeUniqServerId = exports.invariant = exports.rand = void 0;
const jest_message_util_1 = require("jest-message-util");
const rand = () => Math.floor(Math.random() * 10000000);
exports.rand = rand;
const invariant = (condition, message) => {
    if (!condition) {
        throw new Error(message ?? "Invariant violation");
    }
};
exports.invariant = invariant;
const makeUniqServerId = () => `jest-atom-runner-ipc-server-${Date.now() + (0, exports.rand)()}`;
exports.makeUniqServerId = makeUniqServerId;
const makeUniqWorkerId = () => `jest-atom-runner-ipc-worker-${Date.now() + (0, exports.rand)()}`;
exports.makeUniqWorkerId = makeUniqWorkerId;
const validateIPCID = (id) => {
    if (typeof id === "string" && (/ipc/.exec(id)) != null) {
        return id;
    }
    throw new Error(`Invalid IPC id: "${JSON.stringify(id)}"`);
};
exports.validateIPCID = validateIPCID;
const getIPCIDs = () => {
    const serverID = (0, exports.validateIPCID)(process.env.JEST_SERVER_ID);
    const workerID = (0, exports.validateIPCID)(process.env.JEST_WORKER_ID);
    return { serverID, workerID };
};
exports.getIPCIDs = getIPCIDs;
var MessageType;
(function (MessageType) {
    MessageType["INITIALIZE"] = "INITIALIZE";
    MessageType["DATA"] = "DATA";
    MessageType["RUN_TEST"] = "RUN_TEST";
    MessageType["TEST_RESULT"] = "TEST_RESULT";
    MessageType["TEST_FAILURE"] = "TEST_FAILURE";
    MessageType["SHUT_DOWN"] = "SHUT_DOWN";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
exports.MESSAGE_TYPES = Object.keys(MessageType);
const parseJSON = (str) => {
    if (str == null) {
        throw new Error("String needs to be passed when parsing JSON");
    }
    let data;
    try {
        data = JSON.parse(str);
    }
    catch (error) {
        throw new Error(`Can't parse JSON: ${str}`);
    }
    return data;
};
exports.parseJSON = parseJSON;
const makeMessage = ({ messageType, data }) => `${messageType}-${data ?? ""}`;
exports.makeMessage = makeMessage;
const parseMessage = (message) => {
    const messageType = Object.values(exports.MESSAGE_TYPES).find(msgType => message.startsWith(msgType));
    if (messageType == null) {
        throw new Error(`IPC message of unknown type. Message must start from one of the following strings `
            + `representing types followed by "-'.known types: ${JSON.stringify(exports.MESSAGE_TYPES)}`);
    }
    return { messageType, data: message.slice(messageType.length + 1) };
};
exports.parseMessage = parseMessage;
const buildFailureTestResult = (testPath, err, config, globalConfig) => {
    const failureMessage = (0, jest_message_util_1.formatExecError)(err, config, globalConfig);
    return {
        console: undefined,
        displayName: undefined,
        failureMessage,
        leaks: false,
        numFailingTests: 0,
        numPassingTests: 0,
        numPendingTests: 0,
        numTodoTests: 0,
        openHandles: [],
        perfStats: {
            end: 0,
            start: 0,
            slow: false,
            runtime: 0
        },
        skipped: false,
        snapshot: {
            added: 0,
            fileDeleted: false,
            matched: 0,
            unchecked: 0,
            uncheckedKeys: [],
            unmatched: 0,
            updated: 0
        },
        testExecError: { message: failureMessage, stack: err.stack },
        testFilePath: testPath,
        testResults: []
    };
};
exports.buildFailureTestResult = buildFailureTestResult;
//# sourceMappingURL=utils.js.map