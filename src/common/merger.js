const deepmerge = require('deepmerge');

const _overwriteArray = (destinationArray, sourceArray) => sourceArray;

exports.merge = async (params, originalData) => {
    let arrayMerge = null;
    if (params.overwriteArray) {
        arrayMerge = {
            arrayMerge: _overwriteArray
        };
    }
    const mergedData = await deepmerge(originalData, params.data, arrayMerge);
    return mergedData;
};
