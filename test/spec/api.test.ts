import { makeLaptop, startNewSession } from '../utils/api/factory';
import { allureReporter } from '../utils/report';

describe('API', () => {
  beforeAll(() => {
    startNewSession();
  });

  beforeEach(() => {
    allureReporter().epic('TA').feature('API tests');
  });

  test('should accept valid factoryId and callback', async () => {
    const response = await makeLaptop(123);
    response.assertStatus(201);

    const laptop = await response.parse();
    expect(laptop.factoryId).toBe(123);
  });
});
