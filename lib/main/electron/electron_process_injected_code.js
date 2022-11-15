"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * Copyright (C) 2014 Facebook, Inc. and its affiliates
 *
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const electron_1 = require("electron");
const RPCConnection_1 = tslib_1.__importDefault(require("../rpc/RPCConnection"));
const JestWorkerRPC_1 = tslib_1.__importDefault(require("./rpc/JestWorkerRPC"));
const isMain = process.env.isMain === "true";
// for testing purposes, it is probably a good idea to keep everything at
// the same scale so that renders do not vary from device to device.
electron_1.app.commandLine.appendSwitch("high-dpi-support", "1");
electron_1.app.commandLine.appendSwitch("force-device-scale-factor", "1");
// Disable hardware acceleration if requested
if (process.env.JEST_ELECTRON_RUNNER_DISABLE_HARDWARE_ACCELERATION != null) {
    electron_1.app.disableHardwareAcceleration();
}
// Prevent Electron from closing after last window is destroyed because new ones will be created after that.
electron_1.app.on("window-all-closed", (e) => e.preventDefault());
electron_1.app.on("ready", async () => {
    // electron automatically quits if all windows are destroyed,
    // this mainWindow will keep electron running even if all other windows
    // are gone. There's probably a better way to do it
    // TODO Looks like it works without it. Maybe get rid of it for good?
    // const mainWindow = new BrowserWindow({ show: false, webPreferences: { nativeWindowOpen: true } });
    if (isMain) {
        // we spin up an electron process for each test on the main process
        // which pops up an icon for each on macOs. Hiding them is less intrusive
        electron_1.app.dock?.hide();
    }
    else {
        (await Promise.resolve().then(() => tslib_1.__importStar(require("@electron/remote/main")))).initialize();
    }
    const rpcConnection = new RPCConnection_1.default(JestWorkerRPC_1.default);
    await rpcConnection.connect();
});
//# sourceMappingURL=electron_process_injected_code.js.map