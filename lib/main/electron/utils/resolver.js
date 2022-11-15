"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolver = void 0;
const tslib_1 = require("tslib");
const jest_haste_map_1 = tslib_1.__importDefault(require("jest-haste-map"));
const jest_runtime_1 = tslib_1.__importDefault(require("jest-runtime"));
const ATOM_BUILTIN_MODULES = new Set(["atom", "electron"]);
// Atom has builtin modules that can't go through jest transform/cache
// pipeline. There's no easy way to add custom modules to jest, so we'll wrap
// jest Resolver object and make it bypass atom's modules.
const wrapResolver = (resolver) => {
    const isCoreModule = resolver.isCoreModule;
    const resolveModule = resolver.resolveModule;
    resolver.isCoreModule = moduleName => {
        if (ATOM_BUILTIN_MODULES.has(moduleName)) {
            return true;
        }
        else {
            return isCoreModule.call(resolver, moduleName);
        }
    };
    resolver.resolveModule = (from, to, options) => {
        if (ATOM_BUILTIN_MODULES.has(to)) {
            return to;
        }
        else {
            return resolveModule.call(resolver, from, to, options);
        }
    };
    return resolver;
};
function getResolver(config, serializableModuleMap) {
    return wrapResolver(jest_runtime_1.default.createResolver(config, jest_haste_map_1.default.getModuleMapFromJSON(serializableModuleMap)));
}
exports.getResolver = getResolver;
//# sourceMappingURL=resolver.js.map