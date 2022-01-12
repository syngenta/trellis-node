[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=syngenta-digital_package-node-dta&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=syngenta-digital_package-node-dta) [![CircleCI](https://circleci.com/gh/syngenta-digital/package-node-dta.svg?style=shield)](https://circleci.com/gh/syngenta-digital/package-node-dta)
# dta
A DRY multi-database normalizer which forces atomic writes.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init`](https://docs.npmjs.com/creating-a-package-json-file) command.

Installation is done using the
[`npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) command:

```bash
$ npm install @syngenta-digital/dta
```

## Common Usage: DynamoDB

```javascript
const dataAdapter = require('@syngenta-digital/dta');

// initialization
const adapter = dataAdapter.getAdapter({
    engine: 'dynamodb',
    endpoint: 'http://localhost:4000', # optional; if using lambda, it will
    table: 'some-table-name',
    modelSchema: 'v1-grower-model',
    modelSchemaFile: 'application/openapi.yml',
    modelIdentifier: 'grower_id',
    modelVersionKey: 'modified'
});
```

**Initialize Options**

Option Name       | Required | Type   | Description
:-----------      | :------- | :----- | :----------
`engine`          | true     | string | name of supported db engine (dynamodb, neo4j)
`table`           | true     | string | name of dynamodb table
`endpoint`        | false    | string | url of the dynamodb table (useful for local development)
`modelSchema`     | true     | string | key of openapi schema this is being set against
`modelSchemaFile` | true     | string | path where your schema file can found (accepts JSON as well)
`modelIdentifier` | true     | string | unique identifier key on the model
`modelVersionKey` | true     | string | key that can be used as a version key (modified timestamps often suffice)
`authorIdentifier`| false    | string | unique identifier of the author who made the change (optional)
`snsTopicArn`     | false    | string | sns topic arn you want to broadcast the changes to
`snsAttributes`   | false    | string | sns custom attributues to add to the sns message


```javascript
// create
await adapter.create({
    // operation: 'overwrite', (optional; not recommended; default: null)
    data: {
        grower_address: "4939 MILLBROOK RD",
        grower_sfdc_id: "0012400000hbSf9AASETRD",
        grower_search_address: "4939 millbrook rd wooster oh 44691-9132",
        grower_latitude: "40.741687",
        grower_longitude: "-82.00159000000001",
        grower_name: "PAUL CRUSE",
        agrisureaggrementnumber: "9028949018646123897",
        grower_zip: "603923-9132",
        grower_city: "WOOSTER",
        grower_fsap_id: "101722234487.0",
        grower_state: "IL"
    }
});

// read or get
let results = await adapter.read({
    operation: 'get', // query || scan (default: get)
    query: {
        Key: {
            grower_id: '9ab00bffb99f4131988ec278c8ee6b04'
        }
    }
});

// read or query (for use with GSI's)
let results = await adapter.read({
    operation: 'query', // query || scan (default: get)
    query: {
            IndexName: 'grower_id',
            Limit: 1,
            KeyConditionExpression: `grower_id = :grower_id`,
            ExpressionAttributeValues: {
                ':grower_id': grower_id
            }
        }
});

// update
await adapter.update({
    data: {
        grower_address: "4939 MILLBROOK RD",
        grower_search_address: "4939 millbrook rd wooster oh 44691-9132",
        grower_name: "PAUL CRUSE",
        grower_zip: "603923-9132",
        grower_state: "IL",
        modified: "2020-05-27T16:21:06.045Z"
    },
    operation: 'get',
    overwriteArray: true, // (optional) true will overwrite any arrays; false will concat; default is false
    originalVersionKey: '2020-05-27T16:21:06.045Z',
    query: {
        Key: {
            grower_id: '9ab00bffb99f4131988ec278c8ee6b04'
        }
    }
});

// delete
await adapter.delete({
    query: {
        Key: {
            grower_id: '9ab00bffb99f4131988ec278c8ee6b04'
        }
    }
});

// batch write
await adapter.batchOverwrite({
    data:[ // has to be an array
        {
            grower_address: "4939 MILLBROOK RD",
            grower_search_address: "4939 millbrook rd wooster oh 44691-9132",
            grower_name: "PAUL CRUSE",
            grower_zip: "603923-9132",
            grower_state: "IL",
            modified: "2020-05-27T16:21:06.045Z"
        },
        {
            grower_address: "4939 MILLBROOK RD",
            grower_search_address: "4939 millbrook rd wooster oh 44691-9132",
            grower_name: "PAUL CRUSE",
            grower_zip: "603923-9132",
            grower_state: "IL",
            modified: "2020-05-27T16:21:06.045Z"
        },
    ]
});

// batch get
await adapter.batchGet({
    keys: [ // has to be an array
        {
            test_id: 'abc123-2'
        },
        {
            test_id: 'abc123-6'
        }
    ]
});
```

## Common Usage: Neo4j

```javascript
const adapter = await dataAdapter.getAdapter({
    engine: 'neo4j',
    node: 'grower',
    bolt: {
        url: process.env.BOLT_URL,
        user: process.env.BOLT_USER,
        password: process.env.BOLT_PASSWORD
    },
    modelSchema: 'v1-grower-model',
    modelSchemaFile: 'application/openapi.yml',
    modelIdentifier: 'grower_id',
    modelVersionKey: 'modified'
});
```

**Initialize Options**

Option Name       | Required | Type   | Description
:-----------      | :------- | :----- | :----------
`engine`          | true     | string | name of supported db engine (dynamodb, neo4j)
`bolt.url`        | true     | string | bolt url (include protocol; neo4j// or bolt//)
`bolt.user`       | true     | string | bolt user of the db
`bolt.password`   | true     | string | bolt password of the db
`modelSchemaFile` | true     | string | path where your schema file can found (accepts JSON as well)
`modelIdentifier` | true     | string | unique identifier key on the model
`modelVersionKey` | true     | string | key that can be used as a version key (modified timestamps often suffice)
`authorIdentifier`| false    | string | unique identifier of the author who made the change (optional)
`snsTopicArn`     | false    | string | sns topic arn you want to broadcast the changes to
`snsAttributes`   | false    | string | sns custom attributues to add to the sns message


```javascript
// read or match
const results = await adapter.read({
    query: 'MATCH (n) RETURN (n) LIMIT $limit',
    placeholder: {limit: 10},
    serialize: false, // (optional) to get the raw deserialized javascript objects; default: true
    debug: true // (optional) to log the full query sent to neo4j and raw results from neo4j; default: false
});

// create
const results = await adapter.create({
    data: {
        grower_address: "4939 MILLBROOK RD",
        grower_sfdc_id: "0012400000hbSf9AASETRD",
        grower_search_address: "4939 millbrook rd wooster oh 44691-9132",
        grower_latitude: "40.741687",
        grower_longitude: "-82.00159000000001",
        grower_name: "PAUL CRUSE",
        agrisureaggrementnumber: "9028949018646123897",
        grower_zip: "603923-9132",
        grower_city: "WOOSTER",
        grower_fsap_id: "101722234487.0",
        grower_state: "IL"
    }
});

// update or set
const results = await adapter.update({
    query: 'MATCH (g:grower) WHERE g.grower_sfdc_id = $grower_sfdc_id RETURN g LIMIT 1',
    placeholder: {grower_sfdc_id: '0012400000hbSf9AASETRD'},
    overwriteArray: true,   
    originalVersionKey: '2020-10-05'
    data: {
        grower_city: "CHICAGO"
    }
});

// delete or remove
const results = await adapter.delete({
    deleteIdentifier: '859152'
});
```

## Common Usage: S3

```javascript
const adapter = await dataAdapter.getAdapter({
    engine: 'S3',
    bucket: 'growers',
    modelSchema: 'v1-grower-model',
    modelSchemaFile: 'application/openapi.yml',
    modelIdentifier: 'grower_id',
    modelVersionKey: 'modified'
});

// for local development with a local instance of s3 use config object, ex:
// const adapter = dataAdapter.getAdapter({
//     engine: 's3',
//     bucket,
//     modelSchema: 'v1-grower-model',
//     modelSchemaFile: 'test/openapi.yml',
//     modelIdentifier: 'test_id',
//     modelVersionKey: 'modified',
//     config: {
//         s3ForcePathStyle: true,
//         accessKeyId: 'S3_ACCESS',
//         secretAccessKey: 'S3_KEY',
//         region: 'us-east-2',
//         endpoint: new AWS.Endpoint('http://localhost:4566')
//     }
// });
```

**Initialize Options**

Option Name       | Required | Type   | Description
:-----------      | :------- | :----- | :----------
`engine`          | true     | string | name of supported db engine (dynamodb, neo4j)
`modelSchemaFile` | true     | string | path where your schema file can found (accepts JSON as well)
`modelIdentifier` | true     | string | unique identifier key on the model
`modelVersionKey` | true     | string | key that can be used as a version key (modified timestamps often suffice)
`authorIdentifier`| false    | string | unique identifier of the author who made the change (optional)
`snsTopicArn`     | false    | string | sns topic arn you want to broadcast the changes to
`snsAttributes`   | false    | string | sns custom attributues to add to the sns message


```javascript
//create
const params = {
    key: 'create-test.txt',
    encode: true,
    data: 'test=true'
};
await adapter.create(params);

//create with json
const params = {
    key: 'create-test.json',
    json: true,
    encode: true,
    data: {
        test: true
    }
};
await adapter.create(params);

//upload file from disk
const params = {
    key: 'upload.yml',
    path: 'test/openapi.yml'
};
await adapter.upload(params);

//read
const object = await adapter.read({
    key: 'read-test.txt',
    decode: true
});

//read with json
await adapter.create({
    key: 'read-test.json',
    json: true,
    encode: true,
    data: {
        test: true
    }
});

//update (will throw error if object doesn't exist)
await adapter.update({
    key: 'update-test.json',
    json: true,
    encode: true,
    data: {
        test: false
    }
});

//download file to disk (will create directories if they don't exist)
await adapter.download({
    key: 'download.yml',
    path: 'unit/test/openapi-test-download.yml'
});

//delete (will throw error if object doesn't exist)
await adapter.delete({key: 'delete-test.json'});

//get object versions
await adapter.getVersions({key: 'versions-test.json'});

// returns
// [
//   {
//     ETag: '"5cabb4ed9dc2546bae6ab03065c242fc"',
//     Size: 25,
//     StorageClass: 'STANDARD',
//     Key: 'versions-test.json',
//     VersionId: 'null',
//     IsLatest: true,
//     LastModified: 2021-12-15T22:25:05.000Z,
//     Owner: {
//       DisplayName: 'webfile',
//       ID: '75aa57f09aa0c8caeab4f8c24e99d10f8e7faeebf76c078efc7c6caea54ba06a'
//     }
//   }
// ]
```

## Contributing

Please lint and add unit tests.
To run unit tests, please do the following:

0. Have Docker Installed
1. run `npm install`
2. run `npm run local` in a separate session window (must have docker installed)
3. run `npm test` in another session
4. Happy Coding :)
