const {assert} = require('chai');
const dataAdapter = require('../../src');

const baseData = {
    test_id: 'abc123',
    string_key: 'def345',
    number_key: 123,
    created: '2020-10-05',
    modified: '2020-10-05'
};

const boltConfg = {
    url: 'bolt://localhost:7687',
    user: 'neo4j',
    password: 'password'
};

describe('Test Neo4j Adapter', () => {
    describe('Real Neo4j Queries', async () => {
        before(async () => {
            console.log('\n\n==== STARTING NEO4J UNIT TESTS ====\n\n');
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            await adapter.open();
            await adapter._session.run(`MATCH (n) DETACH DELETE n`);
            await adapter.close();
        });
        it('check works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            const results = await adapter.check();
            assert.equal(results, true);
        });
        it('create works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            const results = await adapter.create({
                data: baseData
            });
            assert.deepEqual(results, baseData);
        });
        it('create relationship works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-1';
            await adapter.create({
                data: baseData
            });
            baseData.test_id = 'abc123-2';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.createRelationship({
                query: `MATCH
                    (u1:unittest), (u2:unittest)
                WHERE
                    u1.test_id = $test_id_1
                AND
                    u2.test_id = $test_id_2
                CREATE
                    (u1)-[:related]->(u2)
                RETURN u1,u2`,
                placeholder: {test_id_1: 'abc123-1', test_id_2: 'abc123-2'}
            });
            const jsonRecords = JSON.parse(JSON.stringify(results.records));
            assert.deepEqual(jsonRecords[0].keys, ['u1', 'u2']);
        });
        it('read works (with serialize)', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-3';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: 'abc123-3'}
            });
            assert.deepEqual(results, {
                unittest: [
                    {
                        string_key: 'def345',
                        modified: '2020-10-05',
                        number_key: 123,
                        created: '2020-10-05',
                        test_id: 'abc123-3'
                    }
                ]
            });
        });
        it('read works (without serialize)', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-4';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: 'abc123-4'},
                serialize: false
            });
            assert.equal(results.length, 1);
        });
        it('read works converting integers to neo4j ints', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-4';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) RETURN (u) SKIP $skip LIMIT $limit',
                placeholder: {skip: 0, limit: 10},
                serialize: true
            });
            assert.equal(results.unittest.length > 0, true);
        });
        it('read works converting strings to neo4j ints', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-4';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) RETURN (u) SKIP $skip LIMIT $limit',
                placeholder: {skip: '0', limit: '10'},
                serialize: true
            });
            assert.equal(results.unittest.length > 0, true);
        });
        it('read works with disabling lossless integers', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml',
                driverConfig: {disableLosslessIntegers: true}
            });
            baseData.test_id = 'abc123-4';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) RETURN (u) SKIP $skip LIMIT $limit',
                placeholder: {skip: 0, limit: 10},
                serialize: true
            });
            assert.equal(results.unittest.length > 0, true);
        });
        it('update works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-5';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.update({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: 'abc123-5'},
                data: {
                    string_key: 'def345-1'
                },
                originalVersionKey: '2020-10-05'
            });
            assert.deepEqual(results, {
                test_id: 'abc123-5',
                string_key: 'def345-1',
                number_key: 123,
                created: '2020-10-05',
                modified: '2020-10-05'
            });
        });
        it('delete works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-6';
            await adapter.create({
                data: baseData
            });
            await adapter.open();
            const results = await adapter.delete({
                deleteIdentifier: 'abc123-6'
            });
            assert.deepEqual(results, {
                unittest: [
                    {
                        string_key: 'def345',
                        modified: '2020-10-05',
                        number_key: 123,
                        created: '2020-10-05',
                        test_id: 'abc123-6'
                    }
                ]
            });
        });
        it('query works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-7';
            await adapter.create({
                data: baseData
            });
            await adapter.open();
            const results = await adapter.query('MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)', {
                test_id: 'abc123-7'
            });
            const jsonRecords = JSON.parse(JSON.stringify(results.records));
            assert.equal(jsonRecords.length, 1);
        });
        it('manual connect works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            assert.equal(adapter._session, null);
            await adapter.open();
            assert.equal(adapter._session._open, true);
            await adapter.close();
            assert.equal(adapter._session._open, false);
        });
        it('manual connect & sequential queries work', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            await adapter.open();
            baseData.test_id = 'abc123-8';
            const createResults = await adapter.create({
                data: baseData
            });
            assert.deepEqual(createResults, {
                test_id: 'abc123-8',
                string_key: 'def345',
                number_key: 123,
                created: '2020-10-05',
                modified: '2020-10-05'
            });
            const readResults = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: 'abc123-8'}
            });
            assert.deepEqual(readResults, {
                unittest: [
                    {
                        string_key: 'def345',
                        modified: '2020-10-05',
                        number_key: 123,
                        created: '2020-10-05',
                        test_id: 'abc123-8'
                    }
                ]
            });
            const updateResults = await adapter.update({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: 'abc123-8'},
                data: {
                    string_key: 'def345-3'
                },
                originalVersionKey: '2020-10-05'
            });
            assert.deepEqual(updateResults, {
                test_id: 'abc123-8',
                string_key: 'def345-3',
                number_key: 123,
                created: '2020-10-05',
                modified: '2020-10-05'
            });
            const deleteResults = await adapter.delete({
                deleteIdentifier: 'abc123-8'
            });
            assert.deepEqual(deleteResults, {
                unittest: [
                    {
                        string_key: 'def345-3',
                        modified: '2020-10-05',
                        number_key: 123,
                        created: '2020-10-05',
                        test_id: 'abc123-8'
                    }
                ]
            });
            await adapter.close();
        });
        it('reads relationships', async () => {
            const u2Adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest2',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            await u2Adapter.open();
            baseData.test_id = 'abc123-u2';
            await u2Adapter.create({
                data: baseData
            });
            await u2Adapter.close();
            const u1Adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest1',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            await u1Adapter.open();
            baseData.test_id = 'abc123-u1';
            await u1Adapter.create({
                data: baseData
            });
            await u1Adapter.createRelationship({
                query: `MATCH
                    (u1:unittest1), (u2:unittest2)
                WHERE
                    u1.test_id = $test_id_1
                AND
                    u2.test_id = $test_id_2
                CREATE
                    (u1)-[r:related]->(u2)
                RETURN u1,u2,r`,
                placeholder: {test_id_1: 'abc123-u1', test_id_2: 'abc123-u2'}
            });
            const results = await u1Adapter.read({
                query: 'MATCH (u1:unittest1)-[r:related]-(u2:unittest2) WHERE u1.test_id = $test_id RETURN u1,u2,r',
                placeholder: {test_id: 'abc123-u1'}
            });
            assert.deepEqual(results, {
                unittest1: [
                    {
                        string_key: 'def345',
                        modified: '2020-10-05',
                        number_key: 123,
                        created: '2020-10-05',
                        test_id: 'abc123-u1',
                        related: {
                            string_key: 'def345',
                            modified: '2020-10-05',
                            number_key: 123,
                            created: '2020-10-05',
                            test_id: 'abc123-u2'
                        }
                    }
                ]
            });
            await u1Adapter.close();
        });
        after(async () => {
            console.log('\n\n==== FINISHING NEO4J UNIT TESTS ====\n\n');
        });
    });
});
