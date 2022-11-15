import type { Config } from "@jest/types";
import { SerializableModuleMap } from "jest-haste-map";
export declare type IPCTestData = {
    serializableModuleMap: SerializableModuleMap;
    config: Config.ProjectConfig;
    globalConfig: Config.GlobalConfig;
    path: string;
};
export declare enum TestRunnerTarget {
    RENDERER = "renderer",
    MAIN = "main"
}
