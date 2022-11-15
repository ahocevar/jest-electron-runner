"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const path = tslib_1.__importStar(require("path"));
async function listen(port) {
    return new Promise((resolve, reject) => {
        const app = (0, express_1.default)();
        app.use(express_1.default.static(path.resolve(__dirname, "..", "..", "..", "src", "test", "data")));
        const server = app.listen(port, () => {
            resolve(server);
        }).on("error", reject);
    });
}
async function startServer() {
    let retries = 5;
    while (true) {
        const port = 1024 + Math.floor(Math.random() * 64511);
        try {
            const server = await listen(port);
            return {
                baseUrl: `http://localhost:${port}/`,
                close: () => { server.close(); }
            };
        }
        catch (e) {
            if (retries > 0) {
                retries--;
            }
            else {
                throw e;
            }
        }
    }
}
exports.startServer = startServer;
//# sourceMappingURL=startServer.js.map