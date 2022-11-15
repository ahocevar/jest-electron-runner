"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = void 0;
function once(fn) {
    const none = Symbol("none");
    let result = none;
    return (...args) => {
        if (result === none) {
            result = fn(...args);
        }
        return result;
    };
}
exports.once = once;
//# sourceMappingURL=once.js.map