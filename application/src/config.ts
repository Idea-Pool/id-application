export const parseNumEnv = (value: string, def: number): number => {
    let res = def;
    if (typeof value === "string") {
        res = parseInt(value, 10);
    }
    if (isNaN(res)) {
        res = def;
    }
    return res;
}

export const PREFIX = process.env.ID_APP_PREFIX || "pear";

export const MAX_RETRY = parseNumEnv(process.env.ID_APP_MAX_RETRY, 5);

export const CHECK_INTERVAL = parseNumEnv(process.env.ID_APP_CHECK_INTERVAL, 1000);

export const FAILED_STATUS = parseNumEnv(process.env.ID_APP_FAILED_STATUS, 409);

export const PORT = parseNumEnv(process.env.ID_APP_PORT, 3001);