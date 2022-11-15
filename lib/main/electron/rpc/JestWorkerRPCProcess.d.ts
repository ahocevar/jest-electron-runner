import type { TestResult } from "@jest/test-result";
import { RPCProcess } from "../../rpc/RPCProcess";
import { IPCTestData } from "../../types";
interface Methods {
    runTest(data: IPCTestData): Promise<TestResult>;
    shutDown(): void;
}
export declare class JestWorkerRPCProcess extends RPCProcess<Methods> {
    initializeRemote(): Methods;
}
export {};
