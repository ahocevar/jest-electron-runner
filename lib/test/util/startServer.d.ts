export declare type Server = {
    baseUrl: string;
    close: () => void;
};
export declare function startServer(): Promise<Server>;
