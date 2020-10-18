// import { SerialRequest, DB, Factory, SerialRequestStatus } from '../types'
import { httpGet, prepareUrl, APIResponse, Empty } from './common'
import { env } from '../../config';

// TODO: use these as examples to implement client methods

export interface POCResponse {
    error?: string;
}

const environment = env();
const getUrl = (path: string) => prepareUrl(path, environment.poc)

export interface RequestSerialResponse extends POCResponse {
    token: string;
}
export const requestSerialID = async (factoryId: number, toBeGap?: boolean, toBeFailed?: boolean): Promise<APIResponse<RequestSerialResponse>> => {
    let url = getUrl(`/lambda?factoryId=${factoryId}`);
    if (toBeFailed) {
        url += '&toBeFailed=1';
    } else if (toBeGap) {
        url += '&toBeGap=1';
    }
    return await httpGet<RequestSerialResponse>(url);
};

export interface RequestStatusResponse extends POCResponse {
    id?: string;
}
export const getRequestStatus = async (token: string): Promise<APIResponse<RequestStatusResponse>> => {
    return await httpGet<RequestStatusResponse>(getUrl(`/service?requestToken=${token}`));
};

export const clean = async (): Promise<APIResponse<POCResponse>> => {
    return await httpGet<POCResponse>(getUrl('/clean'));
};

export const process = async (): Promise<APIResponse<POCResponse>> => {
    return await httpGet<POCResponse>(getUrl('/process'));
};