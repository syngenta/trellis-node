const {assert} = require('chai');
const dataAdapter = require('../../src');

const baseData = {
    test_id: 'abc123',
    string_key: 'def345',
    number_key: 123,
    created: '2020-10-05',
    modified: '2020-10-05'
};

describe('Test Neo4j Adapter', () => {
    describe('Real Neo4j Queries', async () => {
        before(async () => {
            console.log('\n\n==== STARTING NEO4J UNIT TESTS ====\n\n');
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            await adapter._session.run(`MATCH (n) DETACH DELETE n`);
            await adapter.close();
        });
        after(async () => {
            console.log('\n\n==== FINISHING NEO4J UNIT TESTS ====\n\n');
        });
        it('adapter check works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            const results = await adapter.check();
            assert.equal(results, true);
        });
        it('adapter create works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            const results = await adapter.create({
                data: baseData
            });
            assert.deepEqual(results, baseData);
        });
        it('adapter create relationship works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-1';
            await adapter.create({
                data: baseData
            });
            await adapter.open();
            baseData.test_id = 'abc123-2';
            await adapter.create({
                data: baseData
            });
            await adapter.open();
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
        it('adapter read works (with serialize)', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-3';
            await adapter.create({
                data: baseData
            });
            await adapter.open();
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
        it('adapter read works (without serialize)', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-4';
            await adapter.create({
                data: baseData
            });
            await adapter.open();
            const results = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: 'abc123-4'},
                serialize: false
            });
            assert.equal(results.length, 1);
        });
        it('adapter update works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            baseData.test_id = 'abc123-5';
            await adapter.create({
                data: baseData
            });
            await adapter.open();
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
        it('adapter delete works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
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
        it('adapter query works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
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

        it('adapter auto connect works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            assert.equal(adapter._session._open, true);
            await adapter.close();
            assert.equal(adapter._session._open, false);
        });
        it('adapter manual connect works', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            assert.equal(adapter._session, null);
            await adapter.open();
            assert.equal(adapter._session._open, true);
            await adapter.close();
            assert.equal(adapter._session._open, false);
        });
        it('adapter manual connect & sequential queries work', async () => {
            const adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
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
        it('adapter reads relationships', async () => {
            const u2Adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest2',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
            });
            await u2Adapter.open();
            baseData.test_id = 'abc123-u2';
            await u2Adapter.create({
                data: baseData
            });
            await u2Adapter.close();
            const u1Adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest1',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                autoConnect: false,
                schemaKey: 'test-neo4j-model',
                schemaPath: 'test/openapi.yml'
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
    });
});
