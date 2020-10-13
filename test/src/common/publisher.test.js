const {assert} = require('chai');
const publisher = require('../../../src/common/publisher');

describe('Test publisher', () => {
    describe('publisher Core Functionality', () => {
        it('publisher does nothing', async () => {
            const results = await publisher.publish({});
            assert.equal(results, undefined);
        });
        it('publisher tries topic', async () => {
            const results = await publisher.publish({
                revisionArn: 'some-arn',
                data: {test_id: 1},
                customAttributes: {}
            });
            assert.equal(results, undefined);
        });
    });
});
