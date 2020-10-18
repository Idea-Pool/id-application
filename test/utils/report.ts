import { env } from '../config';

export const allureReporter = (): typeof reporter => {
    const environment = env();
    for (const key in environment) {
        if (environment.hasOwnProperty(key)) {
            reporter.addEnvironment(key, environment[key]);
        }
    }
    return reporter;
};
