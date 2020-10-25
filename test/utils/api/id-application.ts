// import { SerialRequest, DB, Factory, SerialRequestStatus } from '../types'
import {
  prepareUrl,
  Empty,
  makeRequest,
  method,
  json,
  APIResponse,
  httpGet,
} from './common';
import { env } from '../../config';

export interface IDResponse {
  id?: string;
  error?: string;
}

const environment = env();
const getUrl = (path: string) => prepareUrl(path, environment.applicationHost);

export interface GetIDParameters {
  factoryId?: number,
  callback?: string,
}
export const getID = async ({factoryId, callback}: GetIDParameters): Promise<APIResponse<IDResponse>> => {
  const query = [];
  if (typeof factoryId !== 'undefined') {
    query.push(`factoryId=${factoryId}`);
  }
  if (typeof callback !== 'undefined') {
    query.push(`callback=${callback}`);
  }
  let url = '/id';
  if (query.length) {
    url += '?' + query.join('&');
  }
  return await httpGet<IDResponse>(getUrl(url));
}