"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const types_js_1 = require("../types.js");
const TestRunner_1 = tslib_1.__importDefault(require("./TestRunner"));
class TestRunnerRenderer extends TestRunner_1.default {
    getTarget() {
        return types_js_1.TestRunnerTarget.RENDERER;
    }
}
exports.default = TestRunnerRenderer;
//# sourceMappingURL=TestRunnerRenderer.js.map