import type { Config } from "@jest/types";
import { OnTestFailure, OnTestStart, OnTestSuccess, Test, TestRunnerOptions, TestWatcher } from "jest-runner";
import { TestRunnerTarget } from "../types";
export declare function isMain(target: TestRunnerTarget): target is TestRunnerTarget.MAIN;
export declare function isRenderer(target: TestRunnerTarget): target is TestRunnerTarget.RENDERER;
export default abstract class TestRunner {
    private readonly globalConfig;
    constructor(globalConfig: Config.GlobalConfig);
    abstract getTarget(): TestRunnerTarget;
    runTests(tests: Test[], watcher: TestWatcher, onStart: OnTestStart, onResult: OnTestSuccess, onFailure: OnTestFailure, options: TestRunnerOptions): Promise<void>;
}
