import { allureReporter } from '../utils/report'

describe('Initial', () => {
    beforeEach(() => {
        allureReporter().epic('TA').feature('API tests');
    });

    test('should work', () => {
        expect(true).toBe(true);
    });
});