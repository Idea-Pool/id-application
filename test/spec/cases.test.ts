import { awaitRequests, makeLaptop, setLaptopToFail, setLaptopToTimeout, startNewSession } from '../utils/api/factory';
import { getID, IDResponse } from '../utils/api/id-application';
import { allureReporter } from '../utils/report';
import { ID_RESPONSE } from '../utils/schema';

const FACTORY_ID = 123456;

describe('ID requesting', () => {
    beforeAll(() => {
        startNewSession();
    });

    beforeEach(() => {
      allureReporter().epic('ID Application').feature('E2E');
    });

    test('should work in happy flow', async () => {
        // GIVEN a new laptop is created
        const laptopResponse = await makeLaptop(FACTORY_ID);
        const laptop = await laptopResponse.parse();

        // WHEN the ID is requested
        const newIDResponse = await getID({ factoryId: FACTORY_ID, callback: laptop.callbackUrlBase64});
        newIDResponse.assertStatus(200);

        // THEN the ID should be received
        const data = await awaitRequests<IDResponse>(laptop.token);
        expect(data.requests).toBeDefined();
        expect(data.requests).toHaveLength(1);
        const request = data.requests[0];

        // AND proper ID is received
        expect(request.body).toMatchSchema(ID_RESPONSE);
        expect(request.body.id).toMatch(new RegExp(`^seq${FACTORY_ID}_\\d+$`));

        // AND proper response is sent
        expect(request.status).toBe(200);
    });

    test('should work in flow when ID printing fails', async () => {
        // GIVEN a new laptop is created
        const laptopResponse = await makeLaptop(FACTORY_ID);
        const laptop = await laptopResponse.parse();

        // AND laptop ID printing set to fail
        await setLaptopToFail(laptop.token, 409);

        // WHEN the ID is requested
        const newIDResponse = await getID({ factoryId: FACTORY_ID, callback: laptop.callbackUrlBase64});
        newIDResponse.assertStatus(200);

        // THEN the ID should be received
        const data = await awaitRequests<IDResponse>(laptop.token);
        expect(data.requests).toBeDefined();
        expect(data.requests).toHaveLength(1);
        const request = data.requests[0];

        // AND proper ID is received
        expect(request.body).toMatchSchema(ID_RESPONSE);
        expect(request.body.id).toMatch(new RegExp(`^seq${FACTORY_ID}_\\d+$`));

        // AND proper response is sent
        expect(request.status).toBe(409);
    });

    test('should work in flow when ID printing timeouts', async () => {
        // GIVEN a new laptop is created
        const laptopResponse = await makeLaptop(FACTORY_ID);
        const laptop = await laptopResponse.parse();

        // AND laptop ID printing set to timeout
        await setLaptopToTimeout(laptop.token, 1000, 3);

        // WHEN the ID is requested
        const newIDResponse = await getID({ factoryId: FACTORY_ID, callback: laptop.callbackUrlBase64});
        newIDResponse.assertStatus(200);

        // THEN the ID should be received
        const data = await awaitRequests<IDResponse>(laptop.token, 200);
        expect(data.requests).toBeDefined();
        expect(data.requests).toHaveLength(4);
        const request = data.requests.pop();

        // AND proper ID is received for the last request
        expect(request.body).toMatchSchema(ID_RESPONSE);
        expect(request.body.id).toMatch(new RegExp(`^seq${FACTORY_ID}_\\d+$`));

        // AND proper response is sent for the last request
        expect(request.status).toBe(200);

        // AND all previous requests are correct
        for (const r of data.requests) {
            expect(r.body).toMatchSchema(ID_RESPONSE);
            expect(r.body.id).toBe(request.body.id);
            expect(r.status).toBe(408);
        }
    });
});