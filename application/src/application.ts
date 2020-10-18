import fetch from 'node-fetch';
import { FAILED_STATUS, PREFIX } from './config';
import { schedule } from './schedule';

interface LastID {
    [factoryId: number]: number;
}

const lastIDs: LastID = {};

const getNextID = (factoryId: number): string => {
    if (!lastIDs[factoryId]) {
        lastIDs[factoryId] = 0;
    }
    const nextSerial = ++lastIDs[factoryId];
    return `${PREFIX}${factoryId}_${nextSerial}`;
}

export const serveNextID = (factoryId: number, callback: string): void => {
    const nextId = getNextID(factoryId);
    const s = schedule(async (): Promise<boolean> => {
        console.log(`Trying ${factoryId} -> ${nextId} to ${callback}`);
        try {
            const response = await fetch(callback, {
                method: "POST",
                body: JSON.stringify({
                    id: nextId,
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(`Status ${factoryId} -> ${nextId}: ${response.status}`);
            if (response.status === FAILED_STATUS) {
                s.abort();
            }
            const {id} = await response.json();
            if (!id) {
                return false;
            }
            return response.status < 300;
        } catch (e) {
            return false;
        }
    }).run();
};