import express = require('express');
import { Application, Response, json, urlencoded, NextFunction, Request } from 'express';
import { transports, format } from 'winston';
import { logger } from 'express-winston';
import { testRouter } from './_test';
import { publicRouter } from './public';

const parseNumEnv = (value: string, def: number): number => {
    let res = def;
    if (typeof value === "string") {
        res = parseInt(value, 10);
    }
    if (isNaN(res)) {
        res = def;
    }
    return res;
}

const PORT = parseNumEnv(process.env.PORT, 3002);

const app: Application = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(logger({
    transports: [
        new transports.Console()
    ],
    format: format.combine(
        format.simple(),
        format.colorize()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    requestWhitelist: ['url', 'headers', 'method', 'httpVersion', 'originalUrl', 'query', 'body'],
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
}));
app.use(testRouter);
app.use(publicRouter);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}!`);
});

app.use((err: Error, __: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err)
    }
    // @ts-ignore
    res.status(err.status || 500).send({ error: err.toString(), stack: err.stack });
});
