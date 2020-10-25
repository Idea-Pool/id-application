// See https://json-schema.org/
export const ID_RESPONSE = {
    $id: 'id_response',
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
    },
    required: ['id']
};

export const ERROR_RESPONSE = {
    $id: 'error_response',
    type: 'object',
    properties: {
        error: {
            type: 'string'
        },
    },
    required: ['error']
};