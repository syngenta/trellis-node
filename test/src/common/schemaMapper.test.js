const {assert} = require('chai');
const SchemaMapper = require('../../../src/common/schemaMapper');

describe('Test Schema Mapper', () => {
    describe('Schema Mapper Core Functionality', () => {
        const schemaMapper = new SchemaMapper({
            validate: true,
            schema: 'v1-test-request',
            file: 'test/openapi.yml'
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
            const results = await schemaMapper.map(data);
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
    describe('Schema Mapper Does not Validate', () => {
        const schemaMapper = new SchemaMapper({validate: false});
        it('does nothing', async () => {
            const data = {skip_id: 1};
            const results = await schemaMapper.map(data);
            assert.deepEqual(results, {skip_id: 1});
        });
    });
});
