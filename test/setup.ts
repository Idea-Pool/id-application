import 'jest-allure/dist/setup';
import { matchersWithOptions } from 'jest-json-schema';
import { globals } from './config';

jest.setTimeout(globals.defaultCommandTimeout * 60 * 1000);

const formats = {
    bcp47: /^[a-z]{2}-[A-Z]{2}$/,
}
expect.extend(matchersWithOptions({ formats }));