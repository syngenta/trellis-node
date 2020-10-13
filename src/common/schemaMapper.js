const fs = require('fs');
const yaml = require('js-yaml');
const RefParser = require('json-schema-ref-parser');

const _checkData = (data, propertyKey) => {
    if (data && propertyKey in data && data[propertyKey] !== undefined && data[propertyKey] !== null) {
        return true;
    }
    return false;
};

const _populateSchemaKey = (schemaData, data, propertyKey) => {
    if (_checkData(data, propertyKey)) {
        schemaData[propertyKey] = data[propertyKey];
    }
};

const _populateSchemaArray = (schemaData, data, propertyKey, propertyValue) => {
    for (const item of data[propertyKey]) {
        if (item && typeof data[propertyKey] === 'object') {
            const schemaObject = _populateSchemaObject({}, item, propertyValue.items.properties);
            schemaData[propertyKey].push(schemaObject);
        } else if (item !== undefined && item !== null && item !== 'null') {
            schemaData[propertyKey].push(data[propertyKey][i]);
        }
    }
};

const _populateSchemaObject = (schemaData, data, properties) => {
    const propEntries = Object.entries(properties);
    for (const [propertyKey, propertyValue] of propEntries) {
        if (propertyValue.properties && typeof data[propertyKey] === 'object') {
            schemaData[propertyKey] = {};
            _populateSchemaObject(schemaData[propertyKey], data[propertyKey], propertyValue.properties);
        } else if (propertyValue.items && propertyValue.items.properties && Array.isArray(data[propertyKey])) {
            schemaData[propertyKey] = [];
            _populateSchemaArray(schemaData, data, propertyKey, propertyValue);
        } else {
            _populateSchemaKey(schemaData, data, propertyKey);
        }
    }
    return schemaData;
};

const _populateSchemasWithData = (modelSchema, data) => {
    const schemaData = {};
    const schemas = modelSchema.allOf ? modelSchema.allOf : [modelSchema];
    for (const schema of schemas) {
        if (schema.type === 'object') {
            const properties = schema.properties ? schema.properties : {};
            _populateSchemaObject(schemaData, data, properties);
        }
    }
    return schemaData;
};

const _getSchema = async (schemaKey, schemaPath) => {
    const file = await fs.readFileSync(schemaPath, 'utf8');
    const openapi = await yaml.safeLoad(file);
    const refapi = await RefParser.dereference(openapi);
    return refapi.components.schemas[schemaKey];
};

const mapToSchema = async (data, schemaKey, schemaPath) => {
    const modelSchema = await _getSchema(schemaKey, schemaPath);
    const schemaData = _populateSchemasWithData(modelSchema, data);
    return schemaData;
};

module.exports = {mapToSchema};
