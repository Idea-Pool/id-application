import { Response } from 'node-fetch';
import { IncomingHttpHeaders } from 'http';

export interface Laptop {
    token: string;
    factoryId: number;
    created: number;
    callbackUrl?: string;
    callbackUrlBase64?: string;
}

export interface ReceiveException {
    token: string;
}

export interface TimeoutException extends ReceiveException {
    kind: 'timeout';
    after: number;
    times: number;
}

export interface FailException extends ReceiveException {
    kind: 'fail';
    status: number;
    message?: string;
}

export type CallbackResponse = 'timeout' | 'fail' | 'success';

export interface CallbackRequest {
    token: string;
    headers: IncomingHttpHeaders;
    body: string;
    received: number;
    status: number;
    response: CallbackResponse;
}

export interface DB {
    sessionId: string;
    baseUrl: string;
    laptops: Laptop[];
    exceptions: (TimeoutException | FailException)[];
    requests: CallbackRequest[];
}
