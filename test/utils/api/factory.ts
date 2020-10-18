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
import { DB, Laptop } from '../types';

export interface POCResponse {
  error?: string;
}

const environment = env();
const getUrl = (path: string) => prepareUrl(path, environment.factoryHost);

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
