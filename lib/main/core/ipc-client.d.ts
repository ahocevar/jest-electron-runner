import { ServerID, WorkerID } from "./utils";
export declare type IPCWorker = {
    onMessage(cb: (message: string) => void): void;
    send(message: string): void;
    disconnect(): void;
};
export declare const connectToIPCServer: ({ serverID, workerID }: {
    serverID: ServerID;
    workerID: WorkerID;
}) => Promise<IPCWorker>;
