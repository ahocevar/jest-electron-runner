export interface Request {
    jsonrpc: string;
    method: string;
    params: unknown[];
    id: string;
}
export interface SerializedRequest {
    id: string;
    json: string;
}
export declare function makeRequest(method: string, params: unknown[]): Request;
export declare function serializeRequest(method: string, params: unknown[]): SerializedRequest;
export declare function parseRequest(json: string): Request;
export interface ResponseError {
    code: number;
    message: string;
    data?: string;
}
export interface Response {
    jsonrpc: string;
    id: string;
    result?: unknown;
    error?: ResponseError;
}
export declare function serializeResultResponse(result: unknown, id: string): string;
export declare function serializeErrorResponse(error: unknown, id: string): string;
export declare function parseResponse(json: string): Response;
