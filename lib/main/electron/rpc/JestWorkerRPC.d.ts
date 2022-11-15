import type { TestResult } from "@jest/test-result";
import type { IPCTestData } from "../../types";
declare const methods: {
    runTest(testData: IPCTestData): Promise<TestResult>;
    shutDown(): Promise<any>;
};
export default methods;
