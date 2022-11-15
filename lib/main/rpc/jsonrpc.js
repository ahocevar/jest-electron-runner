"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResponse = exports.serializeErrorResponse = exports.serializeResultResponse = exports.parseRequest = exports.serializeRequest = exports.makeRequest = void 0;
const tslib_1 = require("tslib");
const uuid = tslib_1.__importStar(require("uuid"));
function makeRequest(method, params) {
    return {
        jsonrpc: "2.0",
        method,
        params,
        id: uuid.v4()
    };
}
exports.makeRequest = makeRequest;
function serializeRequest(method, params) {
    const request = makeRequest(method, params);
    return {
        id: request.id,
        json: JSON.stringify(request)
    };
}
exports.serializeRequest = serializeRequest;
function parseRequest(json) {
    return JSON.parse(json);
}
exports.parseRequest = parseRequest;
function serializeResultResponse(result, id) {
    const response = {
        jsonrpc: "2.0",
        result,
        id
    };
    return JSON.stringify(response);
}
exports.serializeResultResponse = serializeResultResponse;
function serializeErrorResponse(error, id) {
    const response = {
        jsonrpc: "2.0",
        error: makeError(error),
        id
    };
    return JSON.stringify(response);
}
exports.serializeErrorResponse = serializeErrorResponse;
function parseResponse(json) {
    return JSON.parse(json);
}
exports.parseResponse = parseResponse;
function makeError(error, code = 1) {
    if (error instanceof Error) {
        return {
            code,
            message: error.message,
            data: error.stack
        };
    }
    return {
        code,
        message: JSON.stringify(error)
    };
}
//# sourceMappingURL=jsonrpc.js.map