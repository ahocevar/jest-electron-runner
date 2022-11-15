import { TestRunnerTarget } from "../types.js";
import TestRunner from "./TestRunner";
export default class TestRunnerRenderer extends TestRunner {
    getTarget(): TestRunnerTarget;
}
