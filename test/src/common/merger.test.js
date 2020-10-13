const {assert} = require('chai');
const merger = require('../../../src/common/merger');

describe('Test Merger', () => {
    describe('Merger Core Functionality', () => {
        it('merge objects together', async () => {
            const data = {test_id: 1};
            const params = {
                overwriteArray: false,
                data: {test_query_id: 2}
            };
            const results = await merger.merge(params, data);
            assert.deepEqual(results, {test_id: 1, test_query_id: 2});
        });
        it('overwrite arrays', async () => {
            const data = {test_id: 1, array_test: [1, 2]};
            const params = {
                overwriteArray: true,
                data: {test_query_id: 2, array_test: [3, 4]}
            };
            const results = await merger.merge(params, data);
            assert.deepEqual(results, {test_id: 1, test_query_id: 2, array_test: [3, 4]});
        });
        it('concat arrays', async () => {
            const data = {test_id: 1, array_test: [1, 2]};
            const params = {
                data: {test_query_id: 2, array_test: [3, 4]}
            };
            const results = await merger.merge(params, data);
            assert.deepEqual(results, {test_id: 1, test_query_id: 2, array_test: [1, 2, 3, 4]});
        });
    });
});
