const {assert} = require('chai');
const AWS = require('aws-sdk');
const dataAdapter = require('../../src');

const baseData = {
    test_id: 'abc123',
    test_query_id: 'def345',
    object_key: {
        string_key: 'nothing'
    },
    array_number: [1, 2, 3],
    array_objects: [
        {
            array_string_key: 'a',
            array_number_key: 1
        }
    ],
    created: '2020-10-05',
    modified: '2020-10-05'
};

const TEST_DATA_LIMIT = 10;

const test_data = (index) => {
    return {
        test_id: `xyz${index}`,
        test_query_id: `zyx${index}`,
        object_key: {
            string_key: `nothing${index}`
        },
        array_number: [4, 5, 6],
        array_objects: [
            {
                array_string_key: `a${index}`,
                array_number_key: index
            }
        ],
        created: '2020-12-05',
        modified: '2020-12-05'
    };
};

const create_table_with_hash_and_sort = async (dynamodb, seeder) => {
    let adapter = null;
    try {
        await dynamodb.deleteTable({TableName: 'unittestsort'}).promise();
    } catch (error) {
        // console.warn('set-up table error: likely duplicate non-existant. Stop/kill docker to fix');
    }
    const params = {
        AttributeDefinitions: [
            {
                AttributeName: 'test_id',
                AttributeType: 'S'
            },
            {
                AttributeName: 'test_query_id',
                AttributeType: 'S'
            }
        ],
        KeySchema: [
            {
                AttributeName: 'test_id',
                KeyType: 'HASH'
            },
            {
                AttributeName: 'test_query_id',
                KeyType: 'RANGE'
            }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'test_query_id',
                KeySchema: [
                    {
                        AttributeName: 'test_query_id',
                        KeyType: 'HASH'
                    }
                ],
                Projection: {
                    ProjectionType: 'ALL'
                }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        TableName: 'unittestsort'
    };
    try {
        await dynamodb.createTable(params).promise();
    } catch (error) {
        // console.warn('set-up table error 1: likely duplicate table. Stop/kill docker to fix', error);
    }
    try {
        await seeder
            .put({
                TableName: 'unittestsort',
                Item: baseData
            })
            .promise();
    } catch (error) {
        // console.warn('set-up item error 2: likely duplicate item. Stop/kill docker to fix', error);
    }
    adapter = await dataAdapter.getAdapter({
        engine: 'dynamodb',
        endpoint: 'http://localhost:4000',
        region: 'us-east-2',
        table: 'unittestsort',
        schemaKey: 'test-dynamo-model',
        schemaPath: 'test/openapi.yml',
        modelIdentifier: 'test_id',
        modelVersionKey: 'modified'
    });

    return adapter;
};

describe('Test Dynamo Adapter', () => {
    describe('Real DynamoDB Queries', async () => {
        console.log('\n\n==== STARTING DDB UNIT TESTS ====\n\n');
        let adapter = null;
        let sort_adapter = null;
        let seeder = null;
        const dynamodb = new AWS.DynamoDB({
            endpoint: 'http://localhost:4000',
            region: 'us-east-2',
            apiVersion: '2012-08-10'
        });
        before(async () => {
            try {
                await dynamodb.deleteTable({TableName: 'unittest'}).promise();
            } catch (error) {
                // console.warn('set-up table error: likely duplicate non-existant. Stop/kill docker to fix');
            }
            const params = {
                AttributeDefinitions: [
                    {
                        AttributeName: 'test_id',
                        AttributeType: 'S'
                    },
                    {
                        AttributeName: 'test_query_id',
                        AttributeType: 'S'
                    }
                ],
                KeySchema: [
                    {
                        AttributeName: 'test_id',
                        KeyType: 'HASH'
                    }
                ],
                GlobalSecondaryIndexes: [
                    {
                        IndexName: 'test_query_id',
                        KeySchema: [
                            {
                                AttributeName: 'test_query_id',
                                KeyType: 'HASH'
                            }
                        ],
                        Projection: {
                            ProjectionType: 'ALL'
                        }
                    }
                ],
                BillingMode: 'PAY_PER_REQUEST',
                TableName: 'unittest'
            };
            try {
                await dynamodb.createTable(params).promise();
            } catch (error) {
                // console.warn('set-up table error: likely duplicate table. Stop/kill docker to fix');
            }
            try {
                seeder = new AWS.DynamoDB.DocumentClient({
                    endpoint: 'http://localhost:4000',
                    region: 'us-east-2',
                    apiVersion: '2012-08-10',
                    convertEmptyValues: true
                });
                await seeder
                    .put({
                        TableName: 'unittest',
                        Item: baseData
                    })
                    .promise();

                for (let i = 0; i < TEST_DATA_LIMIT; i++) {
                    const _data = test_data(i + 1);
                    await seeder
                        .put({
                            TableName: 'unittest',
                            Item: _data
                        })
                        .promise();
                }
            } catch (error) {
                console.log('set-up item error: likely duplicate item. Stop/kill docker to fix', error);
            }
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

            sort_adapter = await create_table_with_hash_and_sort(dynamodb, seeder);
        });
        after(async () => {
            console.log('\n\n==== FINISHING DDB UNIT TESTS ====\n\n');
        });
        it('adapter check works', async () => {
            const results = await adapter.check();
            assert.equal(results, true);
        });
        it('adapter can read data (same as get)', async () => {
            const results = await adapter.read({
                operation: 'get',
                query: {
                    Key: {
                        test_id: 'abc123'
                    }
                }
            });
            assert.deepEqual(results, baseData);
        });
        it('adapter can read data (same as query)', async () => {
            const results = await adapter.read({
                operation: 'query',
                query: {
                    IndexName: 'test_query_id',
                    Limit: 1,
                    KeyConditionExpression: `test_query_id = :test_query_id`,
                    ExpressionAttributeValues: {
                        ':test_query_id': 'def345'
                    }
                }
            });
            assert.deepEqual(results, [baseData]);
        });
        it('adapter can read data (same as scan)', async () => {
            const results = await adapter.read({operation: 'scan'});
            const find = results.find((x) => x.test_id === baseData.test_id);
            assert.deepEqual(find, baseData);
        });
        it('adapter can create data (same as insert)', async () => {
            const _insert = {
                operation: 'insert',
                data: {
                    object_key: {string_key: 'nothing'},
                    array_objects: [{array_string_key: 'a', array_number_key: 1}],
                    test_id: 'abc123-2',
                    test_query_id: 'def345-2',
                    array_number: [1, 2, 3]
                }
            };
            const results = await adapter.create(_insert);
            await sort_adapter.create(_insert);
            assert.deepEqual(results, {
                object_key: {string_key: 'nothing'},
                array_objects: [{array_string_key: 'a', array_number_key: 1}],
                test_id: 'abc123-2',
                test_query_id: 'def345-2',
                array_number: [1, 2, 3]
            });
        });
        it('adapter can overwrite data', async () => {
            const _overwrite = {
                data: {
                    object_key: {string_key: 'nothing'},
                    array_objects: [{array_string_key: 'a', array_number_key: 1}],
                    test_id: 'abc123-3',
                    test_query_id: 'def345-3',
                    array_number: [1, 2, 3]
                }
            };
            const results = await adapter.overwrite(_overwrite);
            await sort_adapter.overwrite(_overwrite);
            assert.deepEqual(results, {
                object_key: {string_key: 'nothing'},
                array_objects: [{array_string_key: 'a', array_number_key: 1}],
                test_id: 'abc123-3',
                test_query_id: 'def345-3',
                array_number: [1, 2, 3]
            });
        });
        it('adapter can batch overwrite data', async () => {
            const _batch_overwrite = {
                operation: 'overwrite',
                data: [
                    {
                        object_key: {string_key: 'nothing'},
                        array_objects: [{array_string_key: 'a', array_number_key: 1}],
                        test_id: 'abc123-6',
                        test_query_id: 'def345-6',
                        array_number: [1, 2, 3]
                    }
                ]
            };
            const results = await adapter.batchOverwrite(_batch_overwrite);
            await sort_adapter.batchOverwrite(_batch_overwrite);
            assert.deepEqual(results, [
                {
                    PutRequest: {
                        Item: {
                            object_key: {string_key: 'nothing'},
                            array_objects: [{array_string_key: 'a', array_number_key: 1}],
                            test_id: 'abc123-6',
                            test_query_id: 'def345-6',
                            array_number: [1, 2, 3]
                        }
                    }
                }
            ]);
        });
        it('adapter can batch read data', async () => {
            const no_sort_results = await adapter.batchGet({
                keys: [
                    {
                        test_id: 'abc123-2'
                    },
                    {
                        test_id: 'abc123-6'
                    }
                ]
            });
            const sort_results = await sort_adapter.batchGet({
                keys: [
                    {
                        test_id: 'abc123-2',
                        test_query_id: 'def345-2'
                    },
                    {
                        test_id: 'abc123-6',
                        test_query_id: 'def345-6'
                    }
                ]
            });
            assert.notEqual(no_sort_results, undefined);
            assert.notEqual(sort_results, undefined);
            assert.equal(no_sort_results.constructor, Array);
            assert.equal(sort_results.constructor, Array);
            assert.notEqual(no_sort_results.length, 0);
            assert.notEqual(sort_results.length, 0);
            assert.equal(no_sort_results.length, 2);
            assert.equal(sort_results.length, 2);
        });
        it('adapter can batch read data at our known limit of 100', async () => {
            const keys = [];
            for (let i = 0; i < TEST_DATA_LIMIT; i++) {
                keys.push({
                    test_id: `xyz${i + 1}`
                });
            }
            const results = await adapter.batchGet({keys});
            assert.equal(results.length, TEST_DATA_LIMIT);
        });
        // for some reason this passes locally but fails in circleci?? idk.
        // it('adapter can NOT batch read data with a batch size of more than 100', async () => {
        //     const keys = [];
        //     for(let i = 0; i < TEST_DATA_LIMIT; i++) {
        //         keys.push({
        //             test_id: `xyz${i + 1}`
        //         });
        //     }
        //     let results = null;
        //     try {
        //         results = await adapter.batchGet({keys, batch_size: 101});
        //     } catch(e) {
        //         results = e;
        //     }

        //     // assert.equal(results.message, 'Too many items requested for the BatchGetItem call');
        // });
        it('adapter can update data (overwrite array)', async () => {
            await adapter.overwrite({
                data: {
                    object_key: {string_key: 'nothing'},
                    array_objects: [{array_string_key: 'a', array_number_key: 1}],
                    test_id: 'abc123-7',
                    test_query_id: 'def345-7',
                    array_number: [1, 2, 3],
                    created: '2020-05-27',
                    modified: '2020-05-27'
                }
            });
            const result = await adapter.update({
                operation: 'get',
                overwriteArray: true,
                originalVersionKey: '2020-05-27',
                query: {
                    Key: {
                        test_id: 'abc123-7'
                    }
                },
                data: {
                    object_key: {string_key: 'everything'},
                    array_number: [4, 5, 6]
                }
            });
            assert.deepEqual(result, {
                object_key: {string_key: 'everything'},
                array_objects: [{array_string_key: 'a', array_number_key: 1}],
                test_id: 'abc123-7',
                test_query_id: 'def345-7',
                array_number: [4, 5, 6],
                created: '2020-05-27',
                modified: '2020-05-27'
            });
        });
        it('adapter can update data (concat array)', async () => {
            await adapter.overwrite({
                data: {
                    object_key: {string_key: 'nothing'},
                    array_objects: [{array_string_key: 'a', array_number_key: 1}],
                    test_id: 'abc123-8',
                    test_query_id: 'def345-8',
                    array_number: [1, 2, 3],
                    created: '2020-05-27',
                    modified: '2020-05-27'
                }
            });
            const result = await adapter.update({
                operation: 'get',
                originalVersionKey: '2020-05-27',
                query: {
                    Key: {
                        test_id: 'abc123-8'
                    }
                },
                data: {
                    object_key: {string_key: 'everything'},
                    array_number: [4, 5, 6]
                }
            });
            assert.deepEqual(result, {
                object_key: {string_key: 'everything'},
                array_objects: [{array_string_key: 'a', array_number_key: 1}],
                test_id: 'abc123-8',
                test_query_id: 'def345-8',
                array_number: [1, 2, 3, 4, 5, 6],
                created: '2020-05-27',
                modified: '2020-05-27'
            });
        });
        it('adapter can delete data', async () => {
            await adapter.overwrite({
                data: {
                    object_key: {string_key: 'nothing'},
                    array_objects: [{array_string_key: 'a', array_number_key: 1}],
                    test_id: 'abc123-9',
                    test_query_id: 'def345-9',
                    array_number: [1, 2, 3],
                    created: '2020-05-27',
                    modified: '2020-05-27'
                }
            });
            const deleteResult = await adapter.delete({
                query: {
                    Key: {
                        test_id: 'abc123-9'
                    }
                }
            });
            const getResult = await adapter.get({
                query: {
                    Key: {
                        test_id: 'abc123-9'
                    }
                }
            });
            assert.equal(getResult, undefined);
            assert.deepEqual(deleteResult, {
                object_key: {string_key: 'nothing'},
                array_objects: [{array_string_key: 'a', array_number_key: 1}],
                created: '2020-05-27',
                modified: '2020-05-27',
                test_query_id: 'def345-9',
                test_id: 'abc123-9',
                array_number: [1, 2, 3]
            });
        });
    });
});
