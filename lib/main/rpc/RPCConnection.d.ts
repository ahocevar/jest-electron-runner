export default class RPCConnection<Methods extends {
    [key: string]: (...args: any[]) => Promise<unknown>;
}> {
    private readonly methods;
    private readonly ipc;
    constructor(methods: Methods);
    connect(serverId?: string): Promise<void>;
}
