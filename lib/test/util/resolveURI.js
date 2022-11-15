"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveURI = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
/**
 * Resolves a filename relative to the src/test/data directory to an absolute file URI which Electron can load from.
 *
 * @param filename - The filename relative to the src/test/data directory.
 * @return The absolute file URI.
 */
function resolveURI(filename) {
    return "file://" + path.resolve(__dirname, "..", "..", "..", "src", "test", "data", filename).replace(/\\/g, "/");
}
exports.resolveURI = resolveURI;
//# sourceMappingURL=resolveURI.js.map