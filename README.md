# dta-node
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
const dataAdapter = require('@syngenta-digita/dta');

// initialization
const adapter = dataAdapter.getAdapter({
    engine: 'dynamodb',
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
`modelSchema`       | true     | string | key of openapi schema this is being set against
`modelSchemaFile`      | true     | string | path where your schema file can found (accepts JSON as well)
`modelIdentifier` | true     | string | unique identifier key on the model
`modelVersionKey` | true     | string | key that can be used as a version key (modified timestamps often suffice)


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
`bolt.url`        | true     | string | bolt url (include protocal; neo4j// or bolt//)
`bolt.user`       | true     | string | bolt user of the db
`bolt.password`   | true     | string | bolt password of the db
`modelSchemaFile`      | true     | string | path where your schema file can found (accepts JSON as well)
`modelIdentifier` | true     | string | unique identifier key on the model
`modelVersionKey` | true     | string | key that can be used as a version key (modified timestamps often suffice)


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

## Contributing

Please lint and add unit tests.
To run unit tests, please do the following:

0. Have Docker Installed
1. run `npm install`
2. run `npm run test-dbs` in a separate session window (must have docker installed)
3. run `npm test` in another session
4. Happy Coding :)
