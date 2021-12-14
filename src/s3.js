const AWS = require('aws-sdk');
const schemaMapper = require('./common/schemaMapper');
const merger = require('./common/merger');
const SNSPublisher = require('./common/publisher');

class S3Adapter {
    constructor(params) {
        this._modelSchema = params.modelSchema;
        this._modelSchemaFile = params.modelSchemaFile;
        this._modelVersionKey = params.modelVersionKey;
        this._modelIdentifier = params.modelIdentifier;
        if (!params.s3_client && params.S3_URL) {
            config = {
                s3ForcePathStyle: true,
                accessKeyId: process.env.S3_ACCESS,
                secretAccessKey: process.env.S3_KEY,
                endpoint: new AWS.Endpoint(process.env.S3_URL)
            };
        }
        this._s3_client = params.s3_client || new AWS.S3(config);
        this._bucket_name = params.bucket_name || process.env.S3_BUCKET;
        this._publisher = new SNSPublisher({
            topicArn: params.snsTopicArn,
            authorIdentifier: params.authorIdentifier,
            modelIdentifier: params.modelIdentifier,
            modelSchema: params.modelSchema,
            snsRegion: params.snsRegion || params.region,
            snsEndpoint: params.snsEndpoint || params.endpoint,
            snsAttributes: params.snsAttributes
        });
    }

    async check() {
        console.log('create');
    }

    async create(params) {
        console.log('create');
    }

    async put(params) {
        console.log('put');
    }

    async read(params) {
        console.log('read');
    }

    async get(params) {
        console.log('get');
    }

    async update(params) {
        console.log('update');
    }

    async delete(params) {
        console.log('delete');
    }

    async _publish(operation, data) {
        await this._publisher.publish({operation, data});
    }
}

module.exports = S3Adapter;
