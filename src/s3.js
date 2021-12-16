const fs = require('fs');
const AWS = require('aws-sdk');
const schemaMapper = require('./common/schemaMapper');
const merger = require('./common/merger');
const SNSPublisher = require('./common/publisher');

class S3Adapter {
    constructor(params) {
        this._bucket = params.bucket;
        this._modelSchema = params.modelSchema;
        this._modelSchemaFile = params.modelSchemaFile;
        this._modelVersionKey = params.modelVersionKey;
        this._modelIdentifier = params.modelIdentifier;
        this._s3 = params.s3 || new AWS.S3(params.config);
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

    async check(params) {
        try {
            const head = {
                Bucket: this._bucket,
                Key: params.key
            };
            await this._s3.headObject(head).promise();
            return true;
        } catch (error) {
            return false;
        }
    }

    async create(params) {
        return this.put(params);
    }

    async put(params) {
        const response = await this._s3
            .putObject({
                Body: this._setBody(params),
                Bucket: this._bucket,
                Key: params.key,
                ContentType: params.json ? 'application/json' : params.contentType,
                ContentEncoding: params.encode ? 'base64' : params.contentEncoding,
                ACL: params.public ? 'public-read' : params.acl
            })
            .promise();
        this._publish('create', this._generatePublishData(params));
        return response;
    }

    async upload(params) {
        const response = await this._s3
            .upload({
                Bucket: this._bucket,
                Key: params.key,
                Body: await fs.readFileSync(params.path),
                ContentType: params.json ? 'application/json' : params.contentType,
                ContentEncoding: params.encode ? 'base64' : params.contentEncoding,
                ACL: params.public ? 'public-read' : params.acl
            })
            .promise();
        this._publish('create', this._generatePublishData(params));
        return response;
    }

    async read(params) {
        return this.get(params);
    }

    async get(params) {
        let object = await this._s3.getObject({Bucket: this._bucket, Key: params.key}).promise();
        if (params.decode) {
            object = object.Body.toString('utf-8');
        }
        if (params.json) {
            object = JSON.parse(object);
        }
        return object;
    }

    async getVersions(params) {
        const response = await this._s3.listObjectVersions({Bucket: this._bucket, Prefix: params.key}).promise();
        return response.Versions;
    }

    async download(params) {
        await this._checkDirectoryExists(params);
        const stream = await this._s3.getObject({Bucket: this._bucket, Key: params.key}).createReadStream();
        stream.pipe(fs.createWriteStream(params.path));
    }

    async update(params) {
        await this.check(params);
        const response = await this.put(params);
        this._publish('update', this._generatePublishData(params));
        return response;
    }

    async delete(params) {
        await this._s3.deleteObject({Bucket: this._bucket, Key: params.key}).promise();
        this._publish('delete', {key: params.key});
    }

    async _publish(operation, data) {
        await this._publisher.publish({operation, data});
    }

    async _checkDirectoryExists(params) {
        const dirArray = params.path.split('/');
        dirArray.pop();
        const directory = dirArray.join('/');
        if (!(await fs.existsSync(directory))) {
            await fs.mkdirSync(directory, {recursive: true});
        }
    }

    async presignedUrl(params) {
        return this._s3.getSignedUrl('getObject', {Bucket: this._bucket, Key: params.key});
    }

    async _generatePublishData(params) {
        return {presigned_url: await this.presignedUrl(params)};
    }

    _setBody(params) {
        let data = params.data;
        if (params.json) {
            data = JSON.stringify(params.data);
        }
        if (params.encode) {
            data = Buffer.from(data);
        }
        return data;
    }
}

module.exports = S3Adapter;
