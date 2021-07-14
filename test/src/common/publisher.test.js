const {assert} = require('chai');
const AWS = require('aws-sdk');
const SNSPublisher = require('../../../src/common/publisher');

describe('Test Publisher', () => {
    describe('Publisher Core Functionality', () => {
        before(async () => {
            AWS.config.update({region: 'us-east-2'});
            const sns = new AWS.SNS({apiVersion: '2010-03-31', endpoint: 'http://localhost:4566'});
            try {
                await sns.createTopic({Name: 'unit-test-topic'}).promise();
            } catch (error) {
                console.error(error);
            }
        });
        it('publish', async () => {
            const publisher = new SNSPublisher({
                topicArn: 'arn:aws:sns:us-east-2:000000000000:unit-test-topic',
                authorIdentifier: 'unit-test',
                modelIdentifier: 'unit-test-id',
                modelSchema: 'v1-unit-test-schema',
                snsAttributes: {unit_test: 'true'},
                snsRegion: 'us-east-2',
                snsEndpoint: 'http://localhost:4566'
            });
            try {
                await publisher.publish({operation: 'create', data: {unit_test: true}});
                assert.equal(true, true);
            } catch (error) {
                console.error(error);
                assert.equal(true, false);
            }
        });
    });
});
