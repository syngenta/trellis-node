const {assert} = require('chai');
const AWS = require('aws-sdk');
const dataAdapter = require('../../src');
const fs = require('fs');

describe('Test S3 Adapter', () => {
    const bucket = 'unit-test';
    const adapter = dataAdapter.getAdapter({
        engine: 's3',
        bucket,
        modelSchema: 'v1-grower-model',
        modelSchemaFile: 'test/openapi.yml',
        modelIdentifier: 'test_id',
        modelVersionKey: 'modified',
        config: {
            s3ForcePathStyle: true,
            accessKeyId: 'S3_ACCESS',
            secretAccessKey: 'S3_KEY',
            region: 'us-east-2',
            endpoint: new AWS.Endpoint('http://localhost:4566')
        }
    });
    before(async () => {
        console.log('\n\n==== STARTING S3 UNIT TESTS ====\n\n');
        const s3 = new AWS.S3({
            s3ForcePathStyle: true,
            accessKeyId: 'S3_ACCESS',
            secretAccessKey: 'S3_KEY',
            region: 'us-east-2',
            endpoint: new AWS.Endpoint('http://localhost:4566')
        });
        try {
            await s3.createBucket({Bucket: bucket}).promise();
            await s3.headBucket({Bucket: bucket}).promise();
            await s3.putBucketVersioning({Bucket: bucket, VersioningConfiguration: {Status: 'Enabled'}}).promise();
        } catch (error) {
            console.error(error);
        }
    });
    describe('Real S3 Operations', async () => {
        it('adapter create work', async () => {
            try {
                const params = {
                    key: 'create-test.txt',
                    encode: true,
                    data: 'test=true'
                };
                await adapter.create(params);
                assert.equal(true, true);
            } catch (error) {
                console.error('create-error', error);
                assert.equal(false, true);
            }
        });
        it('adapter create works with JSON', async () => {
            try {
                const params = {
                    key: 'create-test.json',
                    json: true,
                    encode: true,
                    data: {
                        test: true
                    }
                };
                await adapter.create(params);
                assert.equal(true, true);
            } catch (error) {
                console.error('create-json-error', error);
                assert.equal(false, true);
            }
        });
        it('adapter upload works', async () => {
            try {
                const params = {
                    key: 'upload.yml',
                    path: 'test/openapi.yml'
                };
                await adapter.upload(params);
                assert.equal(true, true);
            } catch (error) {
                console.error('upload-error', error);
                assert.equal(false, true);
            }
        });
        it('adapter read works', async () => {
            try {
                await adapter.create({
                    key: 'read-test.txt',
                    encode: true,
                    data: 'test=true'
                });
                const object = await adapter.read({
                    key: 'read-test.txt',
                    decode: true
                });
                assert.deepEqual(object, 'test=true');
            } catch (error) {
                console.error('read-error', error);
                assert.equal(false, true);
            }
        });
        it('adapter read works with json', async () => {
            try {
                await adapter.create({
                    key: 'read-test.json',
                    json: true,
                    encode: true,
                    data: {
                        test: true
                    }
                });
                const object = await adapter.read({
                    key: 'read-test.json',
                    decode: true,
                    json: true
                });
                assert.deepEqual(object, {test: true});
            } catch (error) {
                console.error('read-json-error', error);
                assert.equal(false, true);
            }
        });
        it('adapter update works', async () => {
            try {
                await adapter.create({
                    key: 'update-test.json',
                    json: true,
                    encode: true,
                    data: {
                        test: true
                    }
                });
                await adapter.update({
                    key: 'update-test.json',
                    json: true,
                    encode: true,
                    data: {
                        test: false
                    }
                });
                const object = await adapter.read({
                    key: 'update-test.json',
                    decode: true,
                    json: true
                });
                assert.deepEqual(object, {test: false});
            } catch (error) {
                console.error('update-json-error', error);
                assert.equal(false, true);
            }
        });
        it('adapter update error is thrown', async () => {
            try {
                const object = await adapter.read({
                    key: 'update-test-fails.json',
                    decode: true,
                    json: true
                });
                assert.equal(false, true);
            } catch (error) {
                assert.equal(true, true);
            }
        });
        it('adapter download works with non-existing directory', async () => {
            try {
                await adapter.upload({
                    key: 'download.yml',
                    path: 'test/openapi.yml'
                });
                await adapter.download({
                    key: 'download.yml',
                    path: 'unit/test/openapi-test-download.yml'
                });
                assert.equal(true, true);
            } catch (error) {
                console.error(error);
                assert.equal(false, true);
            }
        });
        it('adapter delete hard works', async () => {
            try {
                await adapter.create({
                    key: 'delete-test.json',
                    json: true,
                    encode: true,
                    data: {
                        test: true
                    }
                });
                await adapter.delete({key: 'delete-test.json', versions: true});
                assert.equal(true, true);
            } catch (error) {
                console.error(error);
                assert.equal(false, true);
            }
        });
        it('adapter delete works', async () => {
            try {
                await adapter.create({
                    key: 'delete-test.json',
                    json: true,
                    encode: true,
                    data: {
                        test: true
                    }
                });
                await adapter.delete({key: 'delete-test.json'});
                assert.equal(true, true);
            } catch (error) {
                console.error(error);
                assert.equal(false, true);
            }
        });
        it('adapter delete throws error', async () => {
            try {
                await adapter.delete({key: 'delete-fail.json'});
                assert.equal(false, true);
            } catch (error) {
                assert.equal(true, true);
            }
        });
        it('adapter get versions works', async () => {
            try {
                await adapter.create({
                    key: 'versions-test.json',
                    json: true,
                    encode: true,
                    data: {
                        version: 1,
                        test: true
                    }
                });
                await adapter.create({
                    key: 'versions-test.json',
                    json: true,
                    encode: true,
                    data: {
                        version: 2,
                        test: true
                    }
                });
                const versions = await adapter.getVersions({key: 'versions-test.json'});
                assert.equal(versions.length > 0, true);
            } catch (error) {
                console.error(error);
                assert.equal(false, true);
            }
        });
        it('adapter get specific version presigned url works', async () => {
            const key = 'version-url-test.json';
            await adapter.create({
                key,
                json: true,
                encode: true,
                data: {
                    version: 1,
                    test: true
                }
            });
            await adapter.create({
                key,
                json: true,
                encode: true,
                data: {
                    version: 2,
                    test: true
                }
            });
            await adapter.create({
                key,
                json: true,
                encode: true,
                data: {
                    version: 3,
                    test: true
                }
            });
            const versions = await adapter.getVersions({key});
            const version = versions[0].VersionId;
            const presignedUrl = await adapter.presignedUrl({key, version});
            assert.equal(presignedUrl.includes(`versionId=${version}`), true);
        });
    });
    after(async () => {
        const s3 = new AWS.S3({
            s3ForcePathStyle: true,
            accessKeyId: 'S3_ACCESS',
            secretAccessKey: 'S3_KEY',
            region: 'us-east-2',
            endpoint: new AWS.Endpoint('http://localhost:4566')
        });
        try {
            const {Contents} = await s3.listObjects({Bucket: bucket}).promise();
            if (Contents.length > 0) {
                Contents.push({Key: 'delete-test.json'});
                for (const content of Contents) {
                    const versions = await s3.listObjectVersions({Bucket: bucket, Prefix: content.Key}).promise();
                    if (versions.Versions.length > 0) {
                        await s3
                            .deleteObjects({
                                Bucket: bucket,
                                Delete: {Objects: versions.Versions.map(({Key, VersionId}) => ({Key, VersionId}))}
                            })
                            .promise();
                    }
                    if (versions.DeleteMarkers.length > 0) {
                        await s3
                            .deleteObjects({
                                Bucket: bucket,
                                Delete: {Objects: versions.DeleteMarkers.map(({Key, VersionId}) => ({Key, VersionId}))}
                            })
                            .promise();
                    }
                }
            }
            await fs.rmdirSync('unit', {recursive: true});
            await s3.deleteBucket({Bucket: bucket}).promise();
        } catch (error) {
            console.error(error);
        }
        console.log('\n\n==== FINISHING S3 UNIT TESTS ====\n\n');
    });
});
