const {assert} = require('chai');
const {v4: uuidv4} = require('uuid');
const dataAdapter = require('../../src');

const boltConfg = {
    url: 'bolt://localhost:7687',
    user: 'neo4j',
    password: 'password'
};

const createBaseData = () => {
    return {
        test_id: uuidv4(),
        string_key: uuidv4(),
        number_key: 123,
        created: '2020-10-05',
        modified: '2020-10-05'
    };
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
            const baseData = createBaseData();
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
            const baseData1 = createBaseData();
            await adapter.create({
                data: baseData1
            });
            const baseData2 = createBaseData();
            await adapter.create({
                data: baseData2
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
                placeholder: {test_id_1: baseData1.test_id, test_id_2: baseData2.test_id}
            });
            const jsonRecords = JSON.parse(JSON.stringify(results.records));
            assert.deepEqual(jsonRecords[0].keys, ['u1', 'u2']);
        });
        it('delete relationship works', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                autoConnect: false,
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            await adapter.open();
            const baseData1 = createBaseData();
            await adapter.create({
                data: baseData1
            });
            const baseData2 = createBaseData();
            await adapter.create({
                data: baseData2
            });
            await adapter.createRelationship({
                query: `MATCH
                    (u1:unittest), (u2:unittest)
                WHERE
                    u1.test_id = $test_id_1
                AND
                    u2.test_id = $test_id_2
                CREATE
                    (u1)-[:related]->(u2)
                RETURN u1,u2`,
                placeholder: {test_id_1: baseData1.test_id, test_id_2: baseData2.test_id}
            });
            await adapter.read({
                query: `MATCH
                    (u1:unittest)-[r:related]-(u2:unittest)
                WHERE
                    u1.test_id=$test_id_1
                AND
                    u2.test_id=$test_id_2
                RETURN u1,r,u2`,
                placeholder: {test_id_1: baseData1.test_id, test_id_2: baseData2.test_id}
            });
            await adapter.deleteRelationship({
                query: `MATCH
                    (u1:unittest)-[r:related]-(u2:unittest)
                WHERE
                    u1.test_id=$test_id_1
                AND
                    u2.test_id=$test_id_2
                DETACH DELETE r`,
                placeholder: {test_id_1: baseData1.test_id, test_id_2: baseData2.test_id}
            });
            const results = await adapter.read({
                query: `MATCH
                    (u1:unittest)-[r:related]-(u2:unittest)
                WHERE
                    u1.test_id=$test_id_1
                AND
                    u2.test_id=$test_id_2
                RETURN u1,r,u2`,
                placeholder: {test_id_1: baseData1.test_id, test_id_2: baseData2.test_id}
            });
            await adapter.close();
            assert.equal(results.unittest.length === 0, true);
        });
        it('delete relationship stops non-delete relationship query', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            try {
                await adapter.deleteRelationship({
                    query: `MATCH
                        (u1:unittest)-[r:related]-(u2:unittest)
                    WHERE
                        u1.test_id=$test_id_1
                    AND
                        u2.test_id=$test_id_2`,
                    placeholder: {test_id_1: baseData1.test_id, test_id_2: baseData2.test_id}
                });
                assert.equal(false, true);
            } catch (error) {
                assert.equal(true, true);
            }
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
            const baseData = createBaseData();
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: baseData.test_id}
            });
            assert.deepEqual(results, {unittest: [baseData]});
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
            const baseData = createBaseData();
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: baseData.test_id},
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
            const baseData = createBaseData();
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
            const baseData = createBaseData();
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
            const baseData = createBaseData();
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
        it('read works not converting int to neo4j ints', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            const baseData = createBaseData();
            baseData.test_id = '0123456';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: baseData.test_id},
                serialize: true,
                convertNumbers: false
            });
            assert.equal(results.unittest.length > 0, true);
        });
        it('read fails for converting int to neo4j ints and cant find it', async () => {
            const adapter = dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: boltConfg,
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                modelSchema: 'test-neo4j-model',
                modelSchemaFile: 'test/openapi.yml'
            });
            const baseData = createBaseData();
            baseData.test_id = '0123456';
            await adapter.create({
                data: baseData
            });
            const results = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: baseData.test_id},
                serialize: true
            });
            assert.equal(results.unittest.length > 0, false);
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
            const baseData = createBaseData();
            await adapter.create({
                data: baseData
            });
            const results = await adapter.update({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: baseData.test_id},
                data: {
                    string_key: 'def345-1'
                },
                originalVersionKey: '2020-10-05'
            });
            baseData.string_key = 'def345-1';
            assert.deepEqual(results, baseData);
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
            const baseData = createBaseData();
            await adapter.create({
                data: baseData
            });
            await adapter.open();
            const results = await adapter.delete({
                deleteIdentifier: baseData.test_id
            });
            assert.deepEqual(results, {unittest: [baseData]});
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
            const baseData = createBaseData();
            await adapter.create({
                data: baseData
            });
            await adapter.open();
            const results = await adapter.query('MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)', {
                test_id: baseData.test_id
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
            const baseData = createBaseData();
            const createResults = await adapter.create({
                data: baseData
            });
            assert.deepEqual(createResults, baseData);
            const readResults = await adapter.read({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: baseData.test_id}
            });
            assert.deepEqual(readResults, {unittest: [baseData]});
            const updateResults = await adapter.update({
                query: 'MATCH (u:unittest) WHERE u.test_id = $test_id RETURN (u)',
                placeholder: {test_id: baseData.test_id},
                data: {
                    string_key: 'def345-3'
                },
                originalVersionKey: '2020-10-05'
            });
            baseData.string_key = 'def345-3';
            assert.deepEqual(updateResults, baseData);
            const deleteResults = await adapter.delete({
                deleteIdentifier: baseData.test_id
            });
            assert.deepEqual(deleteResults, {unittest: [baseData]});
            await adapter.close();
        });
        it('reads relationships', async () => {
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
            const baseData1 = createBaseData();
            await u1Adapter.create({
                data: baseData1
            });
            await u1Adapter.close();
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
            const baseData2 = createBaseData();
            await u2Adapter.create({
                data: baseData2
            });
            await u2Adapter.createRelationship({
                query: `MATCH
                    (u1:unittest1), (u2:unittest2)
                WHERE
                    u1.test_id = $test_id_1
                AND
                    u2.test_id = $test_id_2
                CREATE
                    (u1)-[r:related]->(u2)
                RETURN u1,u2,r`,
                placeholder: {test_id_1: baseData1.test_id, test_id_2: baseData2.test_id}
            });
            const results = await u2Adapter.read({
                query: 'MATCH (u1:unittest1)-[r:related]-(u2:unittest2) WHERE u1.test_id = $test_id RETURN u1,u2,r',
                placeholder: {test_id: baseData1.test_id}
            });
            assert.deepEqual(results, {
                unittest1: [
                    {
                        string_key: baseData1.string_key,
                        modified: '2020-10-05',
                        number_key: 123,
                        created: '2020-10-05',
                        test_id: baseData1.test_id,
                        related: {
                            string_key: baseData2.string_key,
                            modified: '2020-10-05',
                            number_key: 123,
                            created: '2020-10-05',
                            test_id: baseData2.test_id
                        }
                    }
                ]
            });
            await u2Adapter.close();
        });
        after(async () => {
            console.log('\n\n==== FINISHING NEO4J UNIT TESTS ====\n\n');
        });
    });
});
