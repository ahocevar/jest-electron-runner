"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mock = tslib_1.__importStar(require("jest-mock"));
const jest_util_1 = require("jest-util");
const vm_1 = require("vm");
/** Special context which is handled specially in the hacked runInContext method below */
const RUN_IN_THIS_CONTEXT = {};
/** Remembered original runInContext method. */
const origRunInContext = vm_1.Script.prototype.runInContext;
/**
 * Ugly hack to allow Jest to just use a single Node VM context. The Jest code in question is in a large private
 * method of the standard Jest runtime and it would be a lot of code-copying to create a custom runtime which
 * replaces the script run code. So we hack into the `script.runInContext` method instead to redirect it to
 * `script.runInThisContext` when environment returns the special [[RUN_IN_THIS_CONTEXT]] context.
 */
vm_1.Script.prototype.runInContext = function (context, options) {
    if (context === RUN_IN_THIS_CONTEXT) {
        return this.runInThisContext(options);
    }
    else {
        return origRunInContext.call(this, context, options);
    }
};
class ElectronEnvironment {
    constructor(config) {
        this.global = global;
        this.moduleMocker = new mock.ModuleMocker(global);
        this.fakeTimers = {
            useFakeTimers() {
                throw new Error("fakeTimers are not supported in electron environment");
            },
            clearAllTimers() { }
        };
        // Jest seems to set a new process property and this causes trouble in write-file-atomic module used
        // in Jest's cache transform stuff. So we remember the original property and restore it after Jest
        // installed it's common globals
        const process = global.process;
        (0, jest_util_1.installCommonGlobals)(global, config.globals);
        global.process = process;
    }
    async setup() { }
    async teardown() { }
    getVmContext() {
        // Return special context which is handled specially in the hacked `script.runInContext` function
        return RUN_IN_THIS_CONTEXT;
    }
}
exports.default = ElectronEnvironment;
//# sourceMappingURL=Environment.js.map