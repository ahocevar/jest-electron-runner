/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014-present, Facebook, Inc.
 *
 * See LICENSE.md for licensing information.
 */

import 'source-map-support/register';
import { Context, Script } from "vm";
import * as mock from 'jest-mock';
import { installCommonGlobals } from 'jest-util';
import type { Config } from '@jest/types';

/** Special context which is handled specially in the hacked runInContext method below */
const RUN_IN_THIS_CONTEXT = {}

/** Remembered original runInContext method. */
const origRunInContext = Script.prototype.runInContext;

/**
 * Ugly hack to allow Jest to just use a single Node VM context. The Jest code in question is in a large private
 * method of the standard Jest runtime and it would be a lot of code-copying to create a custom runtime which
 * replaces the script run code. So we hack into the `script.runInContext` method instead to redirect it to
 * `script.runInThisContext` when environment returns the special [[RUN_IN_THIS_CONTEXT]] context.
 */
Script.prototype.runInContext = function(context, options) {
    if (context === RUN_IN_THIS_CONTEXT) {
        return this.runInThisContext(options);
    } else {
        return origRunInContext.call(this, context, options);
    }
}

export default class ElectronEnvironment {
    global: Object;
    moduleMocker: Object;
    fakeTimers: Object;

    constructor(config: Config.ProjectConfig) {
        this.global = global;
        this.moduleMocker = new mock.ModuleMocker(global);
        this.fakeTimers = {
            useFakeTimers() {
                throw new Error('fakeTimers are not supported in electron environment');
            },
            clearAllTimers() { },
        };
        installCommonGlobals(global, config.globals);
    }

    async setup() { }

    async teardown() { }

    public getVmContext(): Context | null {
        // Return special context which is handled specially in the hacked `script.runInContext` function
        return RUN_IN_THIS_CONTEXT;
    }
}
