"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const win = window;
// For some reason without 'unsafe-eval' electron runner can't read snapshot files
// and tries to write them every time it runs
win.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
// react devtools only checks for the presence of a production environment
// in order to suggest downloading it, which means it logs a msg in a test environment
if (win["__REACT_DEVTOOLS_GLOBAL_HOOK__"] == null) {
    win["__REACT_DEVTOOLS_GLOBAL_HOOK__"] = {
        isDisabled: true
    };
}
const electron_1 = require("electron");
const utils_js_1 = require("../core/utils.js");
const runTest_1 = tslib_1.__importDefault(require("./runTest"));
const resolver_1 = require("./utils/resolver");
electron_1.ipcRenderer.on("run-test", async (event, testData, workerID) => {
    try {
        const result = await (0, runTest_1.default)(testData.path, testData.globalConfig, testData.config, (0, resolver_1.getResolver)(testData.config, testData.serializableModuleMap));
        electron_1.ipcRenderer.send(workerID, result);
    }
    catch (error) {
        electron_1.ipcRenderer.send(workerID, (0, utils_js_1.buildFailureTestResult)(testData.path, error instanceof Error ? error : new Error("" + error), testData.config, testData.globalConfig));
        console.error(error);
    }
});
//# sourceMappingURL=browser_window_injected_code.js.map