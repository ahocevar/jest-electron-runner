import * as ipc from "node-ipc";
import type { ServerID } from "./utils";
export declare type IPCServer = InstanceType<typeof ipc.IPC>["server"];
export declare const startServer: ({ serverID }: {
    serverID: ServerID;
}) => Promise<IPCServer>;
