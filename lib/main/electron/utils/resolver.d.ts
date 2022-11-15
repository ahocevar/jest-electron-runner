import type { Config } from "@jest/types";
import { SerializableModuleMap } from "jest-haste-map";
import Resolver from "jest-resolve";
export declare function getResolver(config: Config.ProjectConfig, serializableModuleMap: SerializableModuleMap): Resolver;
