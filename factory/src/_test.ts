import { Request, NextFunction, Router, Response } from 'express';
import { load, clean, getDB, isSessionLoaded, initDatabase, createLaptop, canSessionBeLoaded, getLaptop, addTimeoutException, addFailException, getException, getCallbackRequests } from './db';

export const testRouter = Router();

const X_TEST_SESSION_ID = 'x-test-session-id';
const RESTRICTED_URL = /^\/_/;
const INITIALIZE_URL = /^\/_make/;
const DB_URL = '/_data';

export const getSessionId = (req: Request): string => {
    const sessionId = req.headers[X_TEST_SESSION_ID];
    if (Array.isArray(sessionId)) {
        return sessionId[0];
    }
    return sessionId;
};

const httpError = (code: number, message: string): Error => {
    const err = new Error(message);
    // @ts-ignore
    err.status = code;
    return err;
}

// Validates whether x-test-session-id header is present
// and the sessions DB is loaded!
testRouter.use((req: Request, __, next: NextFunction) => {
    if (!RESTRICTED_URL.test(req.url)) {
        return next();
    }
    const sessionId = getSessionId(req);
    if (!sessionId) {
        return next(httpError(400, `Bad request! ${X_TEST_SESSION_ID} header is missing!`));
    }
    if (!INITIALIZE_URL.test(req.url) && !isSessionLoaded(sessionId)) {
        if (!canSessionBeLoaded(sessionId)) {
            return next(httpError(412, 'Precondition failed! Session is not initialized, use /_make to initialize session with factoryId and baseUrl!'));
        }
        load(sessionId);
    }
    return next();
});

// Creates a new laptop
// PUT /_make {factoryId,baseUr}
testRouter.put(INITIALIZE_URL, (req: Request, res: Response) => {
    const { factoryId, baseUrl } = req.body;
    if (!factoryId) {
        return res.status(400).send({ error: "Bad request! Missing factoryId in body!" });
    }
    if (!baseUrl) {
        return res.status(400).send({ error: "Bad request! Missing baseUrl in body!" });
    }
    const factoryIdNumber = parseInt(String(factoryId), 10);
    if (isNaN(factoryIdNumber) || factoryIdNumber < 1) {
        return res.status(400).send({ error: "Bad request! FactoryId is not valid!" });
    }
    const sessionId = getSessionId(req);
    initDatabase(sessionId, String(baseUrl));
    const laptop = createLaptop(factoryIdNumber);
    res.status(201).send(laptop);
});

// Sets a timeout exception for the given laptop
// POST /_timeout/:token {after,times}
testRouter.post('/_timeout/:token', (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).send({ error: "Bad request! Missing token!" });
    }
    const laptop = getLaptop(token);
    if (!laptop) {
        return res.status(404).send({ error: "Not found! There is no laptop with the given token!" });
    }
    const { after, times } = req.body;
    if (typeof after !== 'number' || after < 1000) {
        return res.status(400).send({ error: "Bad request! Body is not correct: 'after' is not a number or <1000!" });
    }
    if (typeof times !== 'number' || times < 1) {
        return res.status(400).send({ error: "Bad request! Body is not correct: 'times' is not a number or <1!" });
    }
    const existing = getException(token);
    if (existing) {
        return res.status(409).send({ error: "Conflict! There is already an exception set for this laptop!" });
    }
    const exception = addTimeoutException(token, after, times);
    res.status(201).send(exception);
});

// Sets a fail exception for the given laptop
// POST /_fail/:token {status,[message]}
testRouter.post('/_fail/:token', (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).send({ error: "Bad request! Missing token!" });
    }
    const laptop = getLaptop(token);
    if (!laptop) {
        return res.status(404).send({ error: "Not found! There is no laptop with the given token!" });
    }
    const { status, message } = req.body;
    if (typeof status !== 'number' || status < 100 || status > 599) {
        return res.status(400).send({ error: "Bad request! Body is not correct: 'status' is not a valid HTTP Status!" });
    }
    const existing = getException(token);
    if (existing) {
        return res.status(409).send({ error: "Conflict! There is already an exception set for this laptop!" });
    }
    const exception = addFailException(token, status, message);
    res.status(201).send(exception);
});

// Returns all callback requests of a given token
// GET /_requests/:token
testRouter.get('/_requests/:token', (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).send({ error: "Bad request! Missing token!" });
    }
    const laptop = getLaptop(token);
    if (!laptop) {
        return res.status(404).send({ error: "Not found! There is no laptop with the given token!" });
    }
    const requests = getCallbackRequests(token);
    res.status(200).send({ requests });
});

// Clears all the data
// DELETE /_data
testRouter.delete(DB_URL, (__, res: Response) => {
    clean();
    res.status(200).send({});
});

// Returns the DB
// GET /_data
testRouter.get(DB_URL, (req: Request, res: Response) => {
    load(getSessionId(req));
    res.status(200).send(getDB());
});
