import { readJsonSync, writeJsonSync, existsSync } from 'fs-extra';
import { resolve, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

const DB_FOLDER = process.env.DB_FOLDER || resolve('./data');

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
    kind: "timeout";
    after: number;
    times: number;
}

export interface FailException extends ReceiveException {
    kind: "fail";
    status: number;
    message?: string;
}

export type CallbackResponse = "timeout" | "fail" | "success";

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

let db: DB;

const getDBPath = (sessionId: string): string => join(DB_FOLDER, `db_${sessionId}.json`);

export const initDatabase = (sessionId: string, baseUrl: string): void => {
    if (db && db.sessionId !== sessionId) {
        flush();
    }
    if (!db || db.sessionId !== sessionId) {
        db = {
            sessionId,
            baseUrl: baseUrl.replace(/\/$/, ""),
            laptops: [],
            exceptions: [],
            requests: [],
        };
        flush();
    }
}

export const isSessionLoaded = (sessionId: string): boolean => !!db && db.sessionId === sessionId;

export const canSessionBeLoaded = (sessionId: string): boolean => existsSync(getDBPath(sessionId));

export const load = (sessionId: string) => {
    try {
        db = readJsonSync(getDBPath(sessionId));
    } catch (e) {
        clean(sessionId);
    }
};

export const flush = () => {
    writeJsonSync(getDBPath(db.sessionId), db, { spaces: 2 });
};

export const clean = (sessionId?: string) => {
    db = {
        sessionId: sessionId || db.sessionId,
        baseUrl: db.baseUrl,
        laptops: [],
        exceptions: [],
        requests: [],
    };
    flush();
};

export const createLaptop = (factoryId: number): Laptop => {
    const laptop: Laptop = {
        created: Date.now(),
        token: uuidv4(),
        factoryId,
    };
    laptop.callbackUrl = `${db.baseUrl}/receive/${laptop.token}/${db.sessionId}`;
    laptop.callbackUrlBase64 = Buffer.from(laptop.callbackUrl).toString('base64');
    db.laptops.push(laptop);
    flush();
    return laptop;
};

export const getLaptop = (token: string): Laptop => {
    return db.laptops.find(l => l.token === token);
};

export const addTimeoutException = (token: string, after: number, times: number): TimeoutException => {
    const exception: TimeoutException = {
        kind: "timeout",
        after,
        times,
        token,
    };
    db.exceptions.push(exception);
    flush();
    return exception;
};

export const addFailException = (token: string, status: number, message?: string): FailException => {
    const exception: FailException = {
        kind: "fail",
        status,
        token,
        message,
    };
    db.exceptions.push(exception);
    flush();
    return exception;
};

export const getException = (token: string): TimeoutException | FailException => {
    return db.exceptions.find(e => e.token === token);
};

export const logCallbackRequest = (token: string, req: Request, status: number, response: CallbackResponse = "success") => {
    const cbRequest: CallbackRequest = {
        token,
        received: Date.now(),
        body: req.body,
        headers: req.headers,
        status,
        response,
    };
    db.requests.push(cbRequest);
    flush();
    return cbRequest;
};

export const getCallbackRequests = (token: string): CallbackRequest[] => {
    return db.requests.filter(r => r.token === token);
};

export const getDB = () => db;