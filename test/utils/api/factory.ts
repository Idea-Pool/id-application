// import { SerialRequest, DB, Factory, SerialRequestStatus } from '../types'
import {
  prepareUrl,
  Empty,
  makeRequest,
  method,
  json,
  APIResponse,
} from './common';
import { env } from '../../config';
import { v4 as uuidv4 } from 'uuid';
import { RequestInit } from 'node-fetch';
import { CallbackRequest, DB, FailException, Laptop, TimeoutException } from '../types';
import { IDResponse } from './id-application';

export interface POCResponse {
  error?: string;
}

const environment = env();
const getUrl = (path: string) => prepareUrl(path, environment.factoryHost);

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export interface LaptopResponse extends POCResponse, Partial<Laptop> {}

export interface LaptopRequest {
  factoryId: number;
  baseUrl: string;
}

export interface TimeoutRequest {
    after: number;
    times: number;
}

export interface FailRequest {
    status: number;
}

export interface RequestsResponse<T> {
  requests: CallbackRequest<T>[];
}

let sessionId: string;

export const startNewSession = (): void => {
  sessionId = uuidv4();
};

export const makeFactoryRequest = async <R>(
  url: string,
  options?: RequestInit
): Promise<APIResponse<R>> => {
  if (!options) {
    options = {};
  }
  if (!options.headers) {
    options.headers = {};
  }
  if (!sessionId) {
    throw new Error('Session ID is not set, use startNewSession()!');
  }
  options.headers['x-test-session-id'] = sessionId;
  return makeRequest(url, options);
};

export const factoryGet = async <R>(url: string): Promise<APIResponse<R>> => {
  return await makeFactoryRequest<R>(url);
};
export const factoryPost = async <T, R = T>(
  url: string,
  body: T
): Promise<APIResponse<R>> => {
  return await makeFactoryRequest<R>(url, method('POST', json(body)));
};

export const factoryPut = async <T, R = T>(
  url: string,
  body: T
): Promise<APIResponse<R>> => {
  return await makeFactoryRequest<R>(url, method('PUT', json(body)));
};

export const factoryDelete = async <R>(
  url: string
): Promise<APIResponse<R>> => {
  return await makeFactoryRequest<R>(url, method('DELETE'));
};

export const clean = async (): Promise<APIResponse<Empty>> => {
  return await factoryDelete<Empty>(getUrl('/_data'));
};

export const getDB = async (): Promise<APIResponse<DB>> => {
  return await factoryGet<DB>(getUrl('/_data'));
};

export const makeLaptop = async (
  factoryId: number
): Promise<APIResponse<LaptopResponse>> => {
  return await factoryPut<LaptopRequest, LaptopResponse>(getUrl('/_make'), {
    factoryId,
    baseUrl: environment.factoryHost,
  });
};

export const setLaptopToFail = async(token: string, status: number): Promise<APIResponse<FailException>> => {
  return await factoryPost<FailRequest, FailException>(
    getUrl(`/_fail/${token}`),
    { status }
  );
}

export const setLaptopToTimeout = async(token: string, after: number, times: number): Promise<APIResponse<TimeoutException>> => {
  return await factoryPost<TimeoutRequest, TimeoutException>(
    getUrl(`/_timeout/${token}`),
    { after, times }
  );
}

export const getRequests = async <T>(
  token: string,
): Promise<APIResponse<RequestsResponse<T>>> => {
  return await factoryGet<RequestsResponse<T>>(getUrl(`/_requests/${token}`));
}

export const awaitRequests = async <T>(
  token: string, status?: number,
): Promise<RequestsResponse<T>> => {
  for (let i = 0; i < environment.maxRetry; ++i) {
    const response = await getRequests<T>(token);
    const requests = await response.parse();

    if (requests.requests?.length) {
      if (!status || requests.requests.find(r => r.status === status)) {
        return requests;
      }
    }
    await sleep(environment.retryInterval);
  }
  throw new Error('Factory did not receive ID!');
}
