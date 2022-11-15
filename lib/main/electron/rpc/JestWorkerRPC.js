"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const main_1 = require("@electron/remote/main");
const electron_1 = require("electron");
const utils_1 = require("../../core/utils");
const runTest_1 = tslib_1.__importDefault(require("../runTest"));
const resolver_1 = require("../utils/resolver");
const isMain = process.env.isMain === "true";
async function runInNode(testData) {
    try {
        return await (0, runTest_1.default)(testData.path, testData.globalConfig, testData.config, (0, resolver_1.getResolver)(testData.config, testData.serializableModuleMap));
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.buildFailureTestResult)(testData.path, error instanceof Error ? error : new Error("" + error), testData.config, testData.globalConfig);
    }
}
async function runInBrowserWindow(testData) {
    try {
        const workerID = (0, utils_1.makeUniqWorkerId)();
        const win = new electron_1.BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        (0, main_1.enable)(win.webContents);
        win.webContents.on("console-message", (event, level, message, line, sourceId) => {
            if (/\bdeprecated\b/i.exec(message) != null) {
                // Ignore deprecation warnings
                return;
            }
            const levels = [console.trace, console.info, console.warn, console.error];
            levels[level](message);
        });
        await win.loadURL(`file://${require.resolve("../index.html")}`);
        win.webContents.send("run-test", testData, workerID);
        return await new Promise(resolve => {
            electron_1.ipcMain.once(workerID, (event, testResult) => {
                win.destroy();
                resolve(testResult);
            });
        });
    }
    catch (error) {
        const testResult = (0, utils_1.buildFailureTestResult)(testData.path, error instanceof Error ? error : new Error("" + error), testData.config, testData.globalConfig);
        return testResult;
    }
}
function runInNodeOrBrowser(testData) {
    return isMain ? runInNode(testData) : runInBrowserWindow(testData);
}
const methods = {
    runTest(testData) {
        return runInNodeOrBrowser(testData);
    },
    shutDown() {
        return Promise.resolve();
    }
};
exports.default = methods;
//# sourceMappingURL=JestWorkerRPC.js.map