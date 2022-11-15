"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRenderer = exports.isMain = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const throat_1 = tslib_1.__importDefault(require("throat"));
const types_1 = require("../types");
const JestWorkerRPCProcess_1 = require("./rpc/JestWorkerRPCProcess");
const get_electron_bin_1 = require("./utils/get_electron_bin");
const once_1 = require("./utils/once");
// Share ipc server and farm between multiple runs, so we don't restart
// the whole thing in watch mode every time.
let jestWorkerRPCProcess = null;
function isMain(target) {
    return target === types_1.TestRunnerTarget.MAIN;
}
exports.isMain = isMain;
function isRenderer(target) {
    return target === types_1.TestRunnerTarget.RENDERER;
}
exports.isRenderer = isRenderer;
const startWorker = async ({ rootDir, target }) => {
    if (isRenderer(target) && jestWorkerRPCProcess != null) {
        return jestWorkerRPCProcess;
    }
    const proc = new JestWorkerRPCProcess_1.JestWorkerRPCProcess(({ serverID }) => {
        const injectedCodePath = require.resolve("./electron_process_injected_code.js");
        const currentNodeBinPath = process.execPath;
        const electronBin = (0, get_electron_bin_1.getElectronBin)(rootDir);
        const spawnArgs = [electronBin];
        if (process.env.JEST_ELECTRON_RUNNER_MAIN_THREAD_DEBUG_PORT != null) {
            spawnArgs.push(`--inspect=${process.env.JEST_ELECTRON_RUNNER_MAIN_THREAD_DEBUG_PORT}`);
        }
        if (process.env.JEST_ELECTRON_RUNNER_RENDERER_THREAD_DEBUG_PORT != null) {
            spawnArgs.push(`--remote-debugging-port=${process.env.JEST_ELECTRON_RUNNER_RENDERER_THREAD_DEBUG_PORT}`);
        }
        spawnArgs.push(injectedCodePath);
        spawnArgs.push("--no-sandbox");
        spawnArgs.push("--headless");
        if ("gc" in global) {
            spawnArgs.push("--js-flags=--expose-gc");
        }
        return (0, child_process_1.spawn)(currentNodeBinPath, spawnArgs, {
            stdio: [
                "inherit",
                // redirect child process' stdout to parent process stderr, so it
                // doesn't break any tools that depend on stdout (like the ones
                // that consume a generated JSON report from jest's stdout)
                process.stderr,
                "inherit"
            ],
            env: {
                ...process.env,
                ...(isMain(target) ? { isMain: "true" } : {}),
                JEST_SERVER_ID: serverID
            },
            detached: process.env.JEST_ELECTRON_RUNNER_DISABLE_PROCESS_DETACHMENT == null
        });
    });
    if (isRenderer(target)) {
        jestWorkerRPCProcess = proc;
    }
    await proc.start();
    DISPOSABLES.add(() => {
        proc.stop();
    });
    return proc;
};
const registerProcessListeners = (cleanup) => {
    registerProcessListener("SIGINT2", () => {
        cleanup();
        process.exit(130);
    });
    registerProcessListener("exit", () => {
        cleanup();
    });
    registerProcessListener("uncaughtException", () => {
        cleanup();
        // This will prevent other handlers to handle errors
        // (e.g. global Jest handler). TODO: find a way to provide
        // a cleanup function to Jest so it runs it instead
        process.exit(1);
    });
};
const DISPOSABLES = new Set();
class TestRunner {
    constructor(globalConfig) {
        this.globalConfig = globalConfig;
    }
    async runTests(tests, watcher, onStart, onResult, onFailure, options) {
        const isWatch = this.globalConfig.watch || this.globalConfig.watchAll;
        const { maxWorkers, rootDir } = this.globalConfig;
        const concurrency = isWatch
            ? // because watch is usually used in the background, we'll only use
                // half of the regular workers so we don't block other developer
                // environment UIs
                Math.ceil(Math.min(tests.length, maxWorkers) / 2)
            : Math.min(tests.length, maxWorkers);
        const target = this.getTarget();
        const cleanup = (0, once_1.once)(() => {
            for (const dispose of DISPOSABLES) {
                dispose();
                DISPOSABLES.delete(dispose);
            }
        });
        registerProcessListeners(cleanup);
        // Startup the process for renderer tests, since it'll be one
        // process that every test will share.
        if (isRenderer(target)) {
            await startWorker({ rootDir, target });
        }
        await Promise.all(tests.map((0, throat_1.default)(concurrency, async (test) => {
            await onStart(test);
            try {
                const config = test.context.config;
                const globalConfig = this.globalConfig;
                const rpc = await startWorker({ rootDir, target });
                const testResult = await rpc.remote.runTest({
                    serializableModuleMap: test.context.moduleMap.toJSON(),
                    config,
                    globalConfig,
                    path: test.path
                });
                if (testResult.testExecError != null) {
                    await onFailure(test, testResult.testExecError);
                }
                else {
                    await onResult(test, testResult);
                }
                // If we're running tests in electron 'main' process
                // we need to respawn them for every single test.
                if (isMain(target)) {
                    rpc.stop();
                }
            }
            catch (error) {
                await onFailure(test, {
                    message: error instanceof Error ? error.message : "" + error,
                    stack: error instanceof Error ? error.stack : null
                });
            }
        })));
        if (!isWatch) {
            cleanup();
        }
    }
}
exports.default = TestRunner;
// Because in watch mode the TestRunner is recreated each time, we have
// to make sure we're not registering new process events on every test
// run trigger (at some point EventEmitter will start complaining about a
// memory leak if we do).We'll keep a global map of callbacks (because
// `process` is global) and deregister the old callbacks before we register
// new ones.
const REGISTERED_PROCESS_EVENTS_MAP = new Map();
const registerProcessListener = (eventName, cb) => {
    const event = REGISTERED_PROCESS_EVENTS_MAP.get(eventName);
    if (event != null) {
        process.off(eventName, event);
    }
    process.on(eventName, cb);
    REGISTERED_PROCESS_EVENTS_MAP.set(eventName, cb);
};
//# sourceMappingURL=TestRunner.js.map