/// <reference types="node" />
import { ChildProcess } from "child_process";
declare type SpawnFn = ({ serverID }: {
    serverID: string;
}) => ChildProcess;
declare type SpawnNode = {
    useBabel?: boolean;
    initFile: string;
};
export declare class RPCProcess<Methods> {
    private readonly ipc;
    private server?;
    private readonly serverID;
    private isAlive;
    private readonly spawnFn;
    remote: Methods;
    private socket;
    private pendingRequests;
    private subProcess?;
    constructor(spawn: SpawnFn | SpawnNode);
    initializeRemote(): Methods;
    start(): Promise<void>;
    stop(): void;
    jsonRPCCall(method: string, ...args: unknown[]): Promise<unknown>;
    handleJsonRPCResponse(json: string): void;
    private ensureServerStarted;
}
export {};
