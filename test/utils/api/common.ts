import fetch, { Response, RequestInit } from 'node-fetch';
import { env } from '../../config';
import * as STATUS from 'http-status';
import { Status } from 'jest-allure/dist/Reporter';

export { STATUS };

export const MIME_JSON = 'application/json';
export const CONTENT_TYPE_HEADER = 'content-type';

const environment = env();

export const prepareUrl = (url: string, base?: string): string => {
    if (!/^https?:/i.test(url)) {
        base = base || environment.url;
        return [
            base.replace(/\/$/, ''),
            url.replace(/^\//, '')
        ].join('/');
    }
    return url;
};

export interface QueryOptions {
    [key: string]: string | number;
}

export const prepareQuery = (options?: QueryOptions): string => {
    options = options || {};
    const keys = Object.keys(options);
    if (!keys.length) {
        return '';
    }
    const pairs = keys.map(key => `${key}=${options[key]}`);
    return `?${pairs.join('&')}`;
};

// tslint:disable-next-line: no-empty-interface
export interface Empty {

}

export type HTTP_METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE';

const init = (): RequestInit => ({});
const json = <T = string>(body: T, options?: RequestInit): RequestInit => {
    if (!options) {
        options = init();
    }
    options.headers = {
        ...(options.headers || {}),
        [CONTENT_TYPE_HEADER]: MIME_JSON,
    };
    if (typeof body === 'string') {
        options.body = body;
    } else {
        options.body = JSON.stringify(body);
    }
    return options;
};
const method = (httpMethod: HTTP_METHOD, options?: RequestInit): RequestInit => {
    if (!options) {
        options = init();
    }
    options.method = httpMethod;
    return options;
};

export class APIResponse<T> {
    constructor(private response: Response) { }

    assertStatus(status: number = STATUS.OK): APIResponse<T> {
        expect(this.response.status, 'Response status is not correct!').toBe(status);
        expect(this.response.headers.get(CONTENT_TYPE_HEADER), 'Content-Type header is not correct!').toContain(MIME_JSON);
        return this;
    }

    async parse(): Promise<T> {
        const data = await this.response.json();
        reporter.startStep(' -> response body');
        reporter.addAttachment('data', JSON.stringify(data, null, 2), 'application/json');
        reporter.endStep(Status.Passed);
        return data;
    }
}

export const makeRequest = async <R>(url: string, options?: RequestInit): Promise<APIResponse<R>> => {
    url = prepareUrl(url);
    if (options) {
        reporter.startStep(`${options.method || 'GET'}: ${url}`);
        reporter.addAttachment('options', JSON.stringify(options, null, 2), 'application/json');
    } else {
        reporter.startStep(`GET: ${url}`);
    }
    try {
        const response = await fetch(url, options);
        reporter.endStep(Status.Passed);
        return new APIResponse<R>(response);
    } catch (e) {
        reporter.endStep(Status.Failed);
        throw e;
    }
}

export const httpGet = async <R>(url: string): Promise<APIResponse<R>> => {
    return await makeRequest<R>(url);
};

export const httpPost = async <T, R = T>(url: string, body: T): Promise<APIResponse<R>> => {
    return await makeRequest<R>(url, method('POST', json(body)));
};

export const httpPut = async <T, R = T>(url: string, body: T): Promise<APIResponse<R>> => {
    return await makeRequest<R>(url, method('PUT', json(body)));
};

export const httpDelete = async <R>(url: string): Promise<APIResponse<R>> => {
    return await makeRequest<R>(url, method('DELETE'));
};