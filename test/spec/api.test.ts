import { getID } from '../utils/api/id-application';
import { allureReporter } from '../utils/report';
import { ERROR_RESPONSE } from '../utils/schema';

const toBase64 = (s: string): string => Buffer.from(s, 'utf-8').toString('base64');

describe('API', () => {
  beforeEach(() => {
    allureReporter().epic('ID Application').feature('API');
  });

  test('should accept valid factoryId and callback', async () => {
    const response = await getID({factoryId: 123, callback: toBase64('http://dev.id.app')});
    response.assertStatus(200);

    const data = await response.parse();
    expect(data).toEqual({});
  });

  test('should handle missing factoryId', async () => {
    const response = await getID({callback: toBase64('http://dev.id.app')});
    response.assertStatus(404);

    const data = await response.parse();
    expect(data).toMatchSchema(ERROR_RESPONSE);
    expect(data.error).toContain('factoryId');
  });

  test('should handle missing callback', async () => {
    const response = await getID({factoryId: 123});
    response.assertStatus(404);

    const data = await response.parse();
    expect(data).toMatchSchema(ERROR_RESPONSE);
    expect(data.error).toContain('callback');
  });

  test('should handle invalid factoryId', async () => {
    // @ts-ignore
    const response = await getID({factoryId: 'invalid', callback: toBase64('http://dev.id.app')});
    response.assertStatus(404);

    const data = await response.parse();
    expect(data).toMatchSchema(ERROR_RESPONSE);
    expect(data.error).toContain('factoryId');
  });

  test('should handle invalid callback', async () => {
    const response = await getID({factoryId: 123, callback: toBase64('NOT A URL')});
    response.assertStatus(404);

    const data = await response.parse();
    expect(data).toMatchSchema(ERROR_RESPONSE);
    expect(data.error).toContain('callback');
  });
});
