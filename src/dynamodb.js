const AWS = require('aws-sdk');
const SchemaMapper = require('./common/schemaMapper');
const merger = require('./common/merger');
const SNSPublisher = require('./common/publisher');

class DynamodbAdapter {
    constructor(params) {
        this._table = params.table;
        this._modelSchema = params.modelSchema;
        this._modelSchemaFile = params.modelSchemaFile;
        this._modelVersionKey = params.modelVersionKey;
        this._modelIdentifier = params.modelIdentifier;
        this._schemaMapper = new SchemaMapper({
            validate: params.validateSchema !== false ? true : params.validateSchema,
            schema: this._modelSchema,
            file: this._modelSchemaFile
        });
        this._publisher = new SNSPublisher({
            topicArn: params.snsTopicArn,
            authorIdentifier: params.authorIdentifier,
            modelIdentifier: params.modelIdentifier,
            modelSchema: params.modelSchema,
            snsAttributes: params.snsAttributes,
            snsRegion: params.snsRegion || params.region,
            snsEndpoint: params.snsEndpoint || params.endpoint
        });
        this._dynamodb = new AWS.DynamoDB.DocumentClient({
            endpoint: params.endpoint,
            region: params.region,
            apiVersion: '2012-08-10',
            convertEmptyValues: true
        });
    }

    async check() {
        try {
            const results = await this._dynamodb.scan({TableName: this._table, Limit: 1}).promise();
            return !!results.Items;
        } catch (error) {
            console.warn(error);
            return false;
        }
    }

    async batchOverwrite(params) {
        const items = await this._prepareBatchOverwriteQuery(params);
        const batch = 25;
        for (let i = 0; i < items.length; i += batch) {
            const putRequest = items.slice(i, i + batch);
            await this._dynamodb.batchWrite({RequestItems: {[this._table]: putRequest}}).promise();
            await this._batchPublish('create', putRequest);
        }
        return items;
    }

    async batchGet(params) {
        const items = await this._prepareBatchGetQuery(params);
        const batch = params.batch_size || 100;
        const results = [];
        for (let i = 0; i < items[this._table].Keys.length; i += batch) {
            const getRequest = items[this._table].Keys.slice(i, i + batch);
            const result = await this._dynamodb.batchGet({RequestItems: {[this._table]: {Keys: getRequest}}}).promise();
            for (const _result of result.Responses[this._table]) {
                results.push(_result);
            }
        }
        return results;
    }

    async create(params) {
        let result = null;
        if (params.operation === 'overwrite') {
            result = await this.overwrite(params);
        } else {
            result = await this.insert(params);
        }
        return result;
    }

    async insert(params) {
        params.query = await this._prepareInsertQuery(params);
        params.query.ConditionExpression = `attribute_not_exists(${this._modelIdentifier})`;
        await this._dynamodb.put(params.query).promise();
        await this._publish('create', params.query.Item);
        return params.query.Item;
    }

    async read(params) {
        let items = null;
        if (params.operation === 'query') {
            items = await this.query(params);
        } else if (params.operation === 'scan') {
            items = await this.scan(params);
        } else {
            items = await this.get(params);
        }
        return items;
    }

    async get(params) {
        params.query.TableName = this._table;
        const data = await this._dynamodb.get(params.query).promise();
        return data.Item;
    }

    async query(params) {
        params.query.TableName = this._table;
        const data = await this._dynamodb.query(params.query).promise();
        return this._queryResultSetResolver(this.query, params, data);
    }

    async update(params) {
        const originalData = await this._getOriginalData(params);
        const mergedData = await merger.merge(params, originalData);
        const updatedData = await this._schemaMapper.map(mergedData);
        await this._prepareQuery(params, updatedData);
        await this._dynamodb.put(params.query).promise();
        await this._publish('update', params.query.Item);
        return params.query.Item;
    }

    async delete(params) {
        params.query = params.query ? params.query : {};
        params.query.TableName = this._table;
        params.query.ReturnValues = 'ALL_OLD';
        const data = await this._dynamodb.delete(params.query).promise();
        await this._publish('delete', data.Attributes);
        return data.Attributes;
    }

    async overwrite(params) {
        params.query = await this._prepareInsertQuery(params);
        await this._dynamodb.put(params.query).promise();
        await this._publish('create', params.query.Item);
        return params.query.Item;
    }

    async scan(params = {}) {
        params.query = params.query ? params.query : {};
        params.query.TableName = this._table;
        if (params.query.ExclusiveStartKey && params.query.unique_identifier) {
            const cached_eks = params.query.ExclusiveStartKey;
            params.query.ExclusiveStartKey = {
                [params.query.unique_identifier]: cached_eks
            };
        }
        const data = await this._dynamodb.scan(params.query).promise();
        return this._queryResultSetResolver(this.scan, params, data);
    }

    _queryResultSetResolver(method, params, data) {
        if (!Array.isArray(params.items)) {
            params.items = [];
        }
        const currentItems = params.items;
        const newItems = data.Items;
        const continueQuery = this._continueQueryResultSetResolver(params, data);
        if (continueQuery) {
            params.Limit = params.Limit ? params.Limit - newItems.length : undefined;
            params.query.ExclusiveStartKey = data.LastEvaluatedKey;
            params.items = [...currentItems, ...newItems];
            return method.call(this, params);
        }
        const numberOfNewItemsToAdd = params.Limit || newItems.length;
        const returnItems = [...currentItems, ...newItems.slice(0, numberOfNewItemsToAdd)];
        return returnItems;
    }

    _continueQueryResultSetResolver(params, data) {
        const {query} = params;
        const {Limit} = query;
        const {LastEvaluatedKey, Items} = data;
        const endOfResultSetReached = LastEvaluatedKey === undefined;
        if (Limit !== undefined) {
            const numberOfItemsRemaining = Limit - Items.length;
            return !endOfResultSetReached && numberOfItemsRemaining > 0;
        }
        return !endOfResultSetReached;
    }

    async _prepareQuery(params, updatedData) {
        params.query = {};
        params.query.TableName = this._table;
        params.query.Item = updatedData;
        params.query.ConditionExpression = `#${this._modelVersionKey} = :${this._modelVersionKey}`;
        params.query.ExpressionAttributeNames = {};
        params.query.ExpressionAttributeNames[`#${this._modelVersionKey}`] = this._modelVersionKey;
        params.query.ExpressionAttributeValues = {};
        params.query.ExpressionAttributeValues[`:${this._modelVersionKey}`] = params.originalVersionKey;
        return params;
    }

    async _prepareBatchOverwriteQuery(params) {
        const items = [];
        for (const data of params.data) {
            const Item = await this._schemaMapper.map(data);
            items.push({PutRequest: {Item}});
        }
        return items;
    }

    async _prepareBatchGetQuery(params) {
        const items = {};
        const new_key = {Keys: []};
        for (const _key of params.keys) {
            const new_item = {};
            for (const [key, value] of Object.entries(_key)) {
                new_item[key] = value;
            }
            new_key.Keys.push(new_item);
            items[this._table] = new_key;
        }
        return items;
    }

    async _prepareInsertQuery(params) {
        const data = await this._schemaMapper.map(params.data);
        params.query = params.query ? params.query : {};
        params.query.Item = data;
        params.query.TableName = this._table;
        return params.query;
    }

    async _getOriginalData(params) {
        let originalData = null;
        if (params.operation === 'query') {
            originalData = await this.query(params);
        } else {
            originalData = await this.get(params);
        }
        if (!originalData) {
            throw 'update: no data found to update';
        }
        return originalData;
    }

    async _batchPublish(operation, items) {
        for (const item of items) {
            await this._publish(operation, item.PutRequest.Item);
        }
    }

    async _publish(operation, data) {
        await this._publisher.publish({operation, data});
    }
}

module.exports = DynamodbAdapter;
