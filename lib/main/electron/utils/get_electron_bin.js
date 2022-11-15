"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElectronBin = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const getElectronBin = (from) => {
    try {
        // first try to resolve from the `rootDir` of the project
        return path.resolve(require.resolve("electron", { paths: [from] }), "..", "cli.js");
    }
    catch (error) {
        // default to electron included in this package's dependencies
        return path.resolve(require.resolve("electron"), "..", "cli.js");
    }
};
exports.getElectronBin = getElectronBin;
//# sourceMappingURL=get_electron_bin.js.map