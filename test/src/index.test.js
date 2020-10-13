const {assert} = require('chai');
const AWS = require('aws-sdk');
const dataAdapter = require('../../src');
const DynamodbAdapter = require('../../src/dynamodb');
const Neo4JAdapter = require('../../src/neo4j');

describe('Test Data adapter', () => {
    before(async () => {
        console.log('\n\n==== STARTING MAIN UNIT TESTS ====\n\n');
    });
    after(async () => {
        console.log('\n\n==== FINISHING MAIN UNIT TESTS ====\n\n');
    });
    describe('Get DynamoDB Adapter', async () => {
        let adapter = null;
        before(async () => {
            adapter = await dataAdapter.getAdapter({
                engine: 'dynamodb',
                endpoint: 'http://localhost:4000',
                region: 'us-east-2',
                table: 'unittest',
                schemaKey: 'test-dynamo-model',
                schemaPath: 'test/openapi.yml',
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified'
            });
        });
        it('adapter is DynamodbAdapter instance', () => {
            assert.equal(adapter instanceof DynamodbAdapter, true);
        });
        it('adapter._dynamodb is an AWS DynamoDB instance', () => {
            assert.equal(adapter._dynamodb instanceof AWS.DynamoDB.DocumentClient, true);
        });
        it('adapter._table is set', () => {
            assert.equal(adapter._table, 'unittest');
        });
    });
    describe('Get Neo4j Adapter', async () => {
        let adapter = null;
        before(async () => {
            adapter = await dataAdapter.getAdapter({
                engine: 'neo4j',
                node: 'unittest',
                bolt: {
                    url: 'bolt://localhost:7687',
                    user: 'neo4j',
                    password: 'password'
                },
                modelIdentifier: 'test_id',
                modelVersionKey: 'modified',
                schemaKey: 'test-dynamo-model',
                schemaPath: 'test/openapi.yml'
            });
        });
        it('adapter is Neo4JAdapter instance', () => {
            assert.equal(adapter instanceof Neo4JAdapter, true);
        });
        it('adapter._node is set', () => {
            assert.equal(adapter._node, 'unittest');
        });
    });
    describe('Throws Error', async () => {
        it('throws unsupported error', async () => {
            try {
                await dataAdapter.getAdapter({
                    engine: 'not-a-db',
                    modelIdentifier: 'test_id',
                    modelVersionKey: 'modified',
                    schemaKey: 'test-dynamo-model',
                    schemaPath: 'test/openapi.yml'
                });
            } catch (error) {
                assert.equal(error, 'not-a-db is not supported');
            }
        });
    });
});
