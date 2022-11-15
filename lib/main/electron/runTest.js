"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("@jest/console");
const transform_1 = require("@jest/transform");
const fs = tslib_1.__importStar(require("graceful-fs"));
const docblock = tslib_1.__importStar(require("jest-docblock"));
const jest_leak_detector_1 = tslib_1.__importDefault(require("jest-leak-detector"));
const jest_message_util_1 = require("jest-message-util");
const jest_resolve_1 = require("jest-resolve");
const jest_runtime_1 = tslib_1.__importDefault(require("jest-runtime"));
const jest_util_1 = require("jest-util");
const source_map_support_1 = tslib_1.__importDefault(require("source-map-support"));
// Keeping the core of "runTest" as a separate function (as "runTestInternal")
// is key to be able to detect memory leaks. Since all variables are local to
// the function, when "runTestInternal" finishes its execution, they can all be
// freed, UNLESS something else is leaking them (and that's why we can detect
// the leak!).
//
// If we had all the code in a single function, we should manually nullify all
// references to verify if there is a leak, which is not maintainable and error
// prone. That's why "runTestInternal" CANNOT be inlined inside "runTest".
async function runTestInternal(path, globalConfig, config, resolver, context, sendMessageToJest) {
    const testSource = fs.readFileSync(path, "utf8");
    const docblockPragmas = docblock.parse(docblock.extract(testSource));
    const customEnvironment = docblockPragmas["jest-environment"];
    let testEnvironment = config.testEnvironment;
    if (customEnvironment != null) {
        if (Array.isArray(customEnvironment)) {
            throw new Error(`You can only define a single test environment through docblocks, got "${customEnvironment.join(", ")}"`);
        }
        testEnvironment = (0, jest_resolve_1.resolveTestEnvironment)({
            ...config,
            requireResolveFunction: require.resolve,
            testEnvironment: customEnvironment
        });
    }
    const cacheFS = new Map([[path, testSource]]);
    const transformer = await (0, transform_1.createScriptTransformer)(config, cacheFS);
    const TestEnvironment = await transformer.requireAndTranspileModule(testEnvironment);
    const testFramework = await transformer.requireAndTranspileModule(process.env.JEST_JASMINE === "1"
        ? require.resolve("jest-jasmine2")
        : config.testRunner);
    const consoleOut = globalConfig.useStderr ? process.stderr : process.stdout;
    const consoleFormatter = (type, message) => (0, console_1.getConsoleOutput)(
    // 4 = the console call is buried 4 stack frames deep
    console_1.BufferedConsole.write([], type, message, 4), config, globalConfig);
    let testConsole;
    if (globalConfig.silent === true) {
        testConsole = new console_1.NullConsole(consoleOut, consoleOut, consoleFormatter);
    }
    else if (globalConfig.verbose === true && process.type !== "renderer") {
        testConsole = new console_1.CustomConsole(consoleOut, consoleOut, consoleFormatter);
    }
    else {
        testConsole = new console_1.BufferedConsole();
    }
    const environment = new TestEnvironment({ projectConfig: config, globalConfig }, {
        console: testConsole,
        docblockPragmas,
        testPath: path
    });
    if (typeof environment.getVmContext !== "function") {
        console.error(`Test environment found at "${testEnvironment}" does not export a "getVmContext" method, which is `
            + `mandatory from Jest 27. This method is a replacement for "runScript".`);
        process.exit(1);
    }
    const leakDetector = config.detectLeaks
        ? new jest_leak_detector_1.default(environment)
        : null;
    (0, jest_util_1.setGlobal)(environment.global, "console", testConsole);
    const runtime = new jest_runtime_1.default(config, environment, resolver, transformer, cacheFS, {
        changedFiles: context?.changedFiles,
        collectCoverage: globalConfig.collectCoverage,
        collectCoverageFrom: globalConfig.collectCoverageFrom,
        coverageProvider: globalConfig.coverageProvider,
        sourcesRelatedToTestsInChangedFiles: context?.sourcesRelatedToTestsInChangedFiles
    }, path);
    const start = Date.now();
    for (const path of config.setupFiles) {
        const esm = runtime.unstable_shouldLoadAsEsm(path);
        if (esm) {
            await runtime.unstable_importModule(path);
        }
        else {
            runtime.requireModule(path);
        }
    }
    const sourcemapOptions = {
        environment: "node",
        handleUncaughtExceptions: false,
        retrieveSourceMap: source => {
            const sourceMapSource = runtime.getSourceMaps()?.get(source);
            if (sourceMapSource != null) {
                try {
                    return {
                        map: JSON.parse(fs.readFileSync(sourceMapSource, "utf8")),
                        url: source
                    };
                }
                catch {
                    // Ignored
                }
            }
            return null;
        }
    };
    // For tests
    runtime
        .requireInternalModule(require.resolve("source-map-support"), "source-map-support")
        .install(sourcemapOptions);
    // For runtime errors
    source_map_support_1.default.install(sourcemapOptions);
    if (environment.global != null && environment.global.process != null && environment.global.process.exit != null) {
        const realExit = environment.global.process.exit;
        environment.global.process.exit = function exit(code) {
            const error = new jest_util_1.ErrorWithStack(`process.exit called with "${code}"`, exit);
            const formattedError = (0, jest_message_util_1.formatExecError)(error, config, { noStackTrace: false }, undefined, true);
            process.stderr.write(formattedError);
            return realExit(code);
        };
    }
    // if we don't have `getVmContext` on the env skip coverage
    const collectV8Coverage = globalConfig.coverageProvider === "v8" && typeof environment.getVmContext === "function";
    try {
        await environment.setup();
        let result;
        try {
            if (collectV8Coverage) {
                await runtime.collectV8Coverage();
            }
            result = await testFramework(globalConfig, config, environment, runtime, path, sendMessageToJest);
        }
        catch (err) {
            if (err instanceof Error) {
                // Access stack before uninstalling sourcemaps
                void err.stack;
            }
            throw err;
        }
        finally {
            if (collectV8Coverage) {
                await runtime.stopCollectingV8Coverage();
            }
        }
        const testCount = result.numPassingTests + result.numFailingTests + result.numPendingTests
            + result.numTodoTests;
        const end = Date.now();
        const testRuntime = end - start;
        result.perfStats = {
            end,
            runtime: testRuntime,
            slow: testRuntime / 1000 > config.slowTestThreshold,
            start
        };
        result.testFilePath = path;
        result.console = testConsole.getBuffer();
        result.skipped = testCount === result.numPendingTests;
        result.displayName = config.displayName;
        const coverage = runtime.getAllCoverageInfoCopy();
        if (coverage != null) {
            const coverageKeys = Object.keys(coverage);
            if (coverageKeys.length > 0) {
                result.coverage = coverage;
            }
        }
        if (collectV8Coverage) {
            const v8Coverage = runtime.getAllV8CoverageInfoCopy();
            if (v8Coverage != null && v8Coverage.length > 0) {
                result.v8Coverage = v8Coverage;
            }
        }
        if (globalConfig.logHeapUsage) {
            if (global.gc != null) {
                global.gc();
            }
            result.memoryUsage = process.memoryUsage().heapUsed;
        }
        // Delay the resolution to allow log messages to be output.
        return await new Promise(resolve => {
            setImmediate(() => resolve({ leakDetector, result }));
        });
    }
    finally {
        runtime.teardown();
        await environment.teardown();
        source_map_support_1.default.resetRetrieveHandlers();
    }
}
async function runTest(path, globalConfig, config, resolver, context, sendMessageToJest) {
    const { leakDetector, result } = await runTestInternal(path, globalConfig, config, resolver, context, sendMessageToJest);
    if (leakDetector != null) {
        // We wanna allow a tiny but time to pass to allow last-minute cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
        // Resolve leak detector, outside the "runTestInternal" closure.
        result.leaks = await leakDetector.isLeaking();
    }
    else {
        result.leaks = false;
    }
    return result;
}
exports.default = runTest;
//# sourceMappingURL=runTest.js.map