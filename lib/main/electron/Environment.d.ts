/// <reference types="node" />
import type { Config } from "@jest/types";
import { Context } from "vm";
export default class ElectronEnvironment {
    global: Object;
    moduleMocker: Object;
    fakeTimers: Object;
    constructor(config: Config.ProjectConfig);
    setup(): Promise<void>;
    teardown(): Promise<void>;
    getVmContext(): Context | null;
}
