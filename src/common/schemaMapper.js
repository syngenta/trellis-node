const fs = require('fs');
const yaml = require('js-yaml');
const RefParser = require('json-schema-ref-parser');

class SchemaMapper {
    constructor(construct = {}) {
        this.validate = construct.validate;
        this.schema = construct.schema;
        this.file = construct.file;
    }

    async map(data) {
        if (this.validate) {
            const schema = await this.__getSchema();
            return this.__populateSchemasWithData(schema, data);
        }
        return data;
    }

    async __getSchema() {
        const file = await fs.readFileSync(this.file, 'utf8');
        const openapi = await yaml.load(file);
        const refapi = await RefParser.dereference(openapi);
        return refapi.components.schemas[this.schema];
    }

    __populateSchemasWithData(modelSchema, data) {
        const schemaData = {};
        const schemas = modelSchema.allOf ? modelSchema.allOf : [modelSchema];
        for (const schema of schemas) {
            if (schema.type === 'object') {
                const properties = schema.properties ? schema.properties : {};
                this.__populateSchemaObject(schemaData, data, properties);
            }
        }
        return schemaData;
    }

    __populateSchemaObject(schemaData, data, properties) {
        const propEntries = Object.entries(properties);
        for (const [propertyKey, propertyValue] of propEntries) {
            if (propertyValue.properties && typeof data[propertyKey] === 'object') {
                schemaData[propertyKey] = {};
                this.__populateSchemaObject(schemaData[propertyKey], data[propertyKey], propertyValue.properties);
            } else if (propertyValue.items && propertyValue.items.properties && Array.isArray(data[propertyKey])) {
                schemaData[propertyKey] = [];
                this.__populateSchemaArray(schemaData, data, propertyKey, propertyValue);
            } else {
                this.__populateSchemaKey(schemaData, data, propertyKey);
            }
        }
        return schemaData;
    }

    __populateSchemaArray(schemaData, data, propertyKey, propertyValue) {
        for (const item of data[propertyKey]) {
            if (item && typeof data[propertyKey] === 'object') {
                const schemaObject = this.__populateSchemaObject({}, item, propertyValue.items.properties);
                schemaData[propertyKey].push(schemaObject);
            } else if (item !== undefined && item !== null && item !== 'null') {
                schemaData[propertyKey].push(data[propertyKey][i]);
            }
        }
    }

    __populateSchemaKey(schemaData, data, propertyKey) {
        if (this.__checkData(data, propertyKey)) {
            schemaData[propertyKey] = data[propertyKey];
        }
    }

    __checkData(data, propertyKey) {
        if (data && propertyKey in data && data[propertyKey] !== undefined && data[propertyKey] !== null) {
            return true;
        }
        return false;
    }
}

module.exports = SchemaMapper;
