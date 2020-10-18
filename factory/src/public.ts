import { Request, Router, Response } from 'express';
import { OK, BAD_REQUEST, NOT_FOUND, NOT_ACCEPTABLE, REQUEST_TIMEOUT } from 'http-status';
import { getLaptop, getException, logCallbackRequest, getCallbackRequests, CallbackRequest } from './db';

export const publicRouter = Router();

const hasSuccessRequest = (requests: CallbackRequest[]): boolean => requests.some(r => r.response === "success");
const getTimeoutRequestCount = (requests: CallbackRequest[]): number => requests.filter(r => r.response === "timeout").length;

publicRouter.get('/status', (__, res: Response) => {
    res.send('OK');
});

publicRouter.post('/receive/:token/:sessionId', (req: Request, res: Response) => {
    const { token, sessionId } = req.params;
    if (!sessionId) {
        return res.status(BAD_REQUEST).send({ error: "Bad request! Missing sessionId!" });
    }
    if (!token) {
        return res.status(BAD_REQUEST).send({ error: "Bad request! Missing token!" });
    }
    if (!req.body.id) {
        return res.status(BAD_REQUEST).send({ error: "Bad request! Missing ID!" });
    }
    const laptop = getLaptop(token);
    if (!laptop) {
        return res.status(NOT_FOUND).send({ error: "Not found! There is no laptop with the given token!" });
    }
    const requests = getCallbackRequests(token);
    if (hasSuccessRequest(requests)) {
        logCallbackRequest(token, req, NOT_ACCEPTABLE, "fail")
        return res.status(NOT_ACCEPTABLE).send({ error: "Not acceptable! ID already accepted!" });
    }

    const exception = getException(token);
    if (!exception) {
        logCallbackRequest(token, req, OK, "success");
        return res.status(OK).send(req.body);
    }
    switch (exception.kind) {
        case "fail":
            logCallbackRequest(token, req, exception.status, "fail");
            return res.status(exception.status).send({ error: exception.message || "Fail!" });
        case "timeout":
            const timeoutRequests = getTimeoutRequestCount(requests);
            console.log({ timeoutRequests, times: exception.times });
            if (timeoutRequests >= exception.times) {
                logCallbackRequest(token, req, OK, "success");
                return res.status(OK).send(req.body);
            } else {
                logCallbackRequest(token, req, REQUEST_TIMEOUT, "timeout");
                setTimeout(() => {
                    res.status(REQUEST_TIMEOUT).send({ error: "Timeout!" });
                }, exception.after);
            }
            break;
    }
});
