import type { TestResult } from "@jest/test-result";
import type { Config } from "@jest/types";
export declare type WorkerID = string;
export declare type ServerID = string;
export declare const rand: () => number;
export declare const invariant: (condition: boolean, message?: string) => void;
export declare const makeUniqServerId: () => ServerID;
export declare const makeUniqWorkerId: () => WorkerID;
export declare const validateIPCID: (id?: string) => string;
export declare const getIPCIDs: () => {
    serverID: ServerID;
    workerID: WorkerID;
};
export declare enum MessageType {
    INITIALIZE = "INITIALIZE",
    DATA = "DATA",
    RUN_TEST = "RUN_TEST",
    TEST_RESULT = "TEST_RESULT",
    TEST_FAILURE = "TEST_FAILURE",
    SHUT_DOWN = "SHUT_DOWN"
}
export declare const MESSAGE_TYPES: "INITIALIZE" | "DATA" | "RUN_TEST" | "TEST_RESULT" | "TEST_FAILURE" | "SHUT_DOWN";
export declare const parseJSON: (str?: string) => Object;
export interface Message {
    messageType: MessageType;
    data?: string;
}
export declare const makeMessage: ({ messageType, data }: Message) => string;
export declare const parseMessage: (message: string) => Message;
export declare const buildFailureTestResult: (testPath: string, err: Error, config: Config.ProjectConfig, globalConfig: Config.GlobalConfig) => TestResult;
