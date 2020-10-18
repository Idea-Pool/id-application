import express = require('express');
import { transports, format } from 'winston';
import { logger } from 'express-winston';
import { serveNextID } from './application';

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

const PORT = parseNumEnv(process.env.PORT, 3001);

const app: express.Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
}));

interface IDQuery {
    factoryId?: number | string;
    callback?: string;
}

app.get('/id', (req, res) => {
    const {factoryId, callback} = req.query as IDQuery;

    if (typeof factoryId === "undefined" || !factoryId) {
        return res.status(404).send({error: "Bad request! Missing factoryId!"});
    }
    if (typeof callback === "undefined" || !callback) {
        return res.status(404).send({error: "Bad request! Missing callback!"});
    }

    const nFactoryId = parseInt(String(factoryId), 10);
    if (isNaN(nFactoryId)) {
        return res.status(404).send({error: "Bad request! Incorrect factoryId!"});
    }
    const callbackUrl = Buffer.from(callback, "base64").toString("utf-8");
    if (!/https?:\/\//i.test(callbackUrl)) {
        return res.status(404).send({error: "Bad request! Incorrect callback URL!"});
    }

    serveNextID(nFactoryId, callbackUrl);
    res.status(200).send({});
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}!`);
});

app.use((err: Error, __: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(err);
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).send({ error: err.toString() });
});
