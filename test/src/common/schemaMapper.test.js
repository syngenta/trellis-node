const {assert} = require('chai');
const schemaMapper = require('../../../src/common/schemaMapper');

describe('Test Schema Mapper', () => {
    describe('Schema Mapper Core Functionality', () => {
        it('add null keys to schema', async () => {
            const data = {test_id: 1};
            const results = await schemaMapper.mapToSchema(data, 'v1-test-request', 'test/openapi.yml');
            assert.deepEqual(results, {test_id: 1});
        });
        it('remove keys from data', async () => {
            const data = {
                test_id: 1,
                object_key: {string_key: 'string'},
                array_number: [1],
                array_objects: [
                    {
                        array_string_key: 'string',
                        array_number_key: 2,
                        removed_key: true
                    }
                ],
                removed_key: true
            };
            const results = await schemaMapper.mapToSchema(data, 'v1-test-request', 'test/openapi.yml');
            assert.deepEqual(results, {
                test_id: 1,
                object_key: {string_key: 'string'},
                array_number: [1],
                array_objects: [
                    {
                        array_string_key: 'string',
                        array_number_key: 2
                    }
                ]
            });
        });
    });
});
