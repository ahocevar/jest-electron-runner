import type { TestFileEvent, TestResult } from "@jest/test-result";
import type { Config } from "@jest/types";
import Resolver from "jest-resolve";
import type { TestRunnerContext } from "jest-runner";
export default function runTest(path: string, globalConfig: Config.GlobalConfig, config: Config.ProjectConfig, resolver: Resolver, context?: TestRunnerContext, sendMessageToJest?: TestFileEvent): Promise<TestResult>;
