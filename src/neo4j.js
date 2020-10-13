const neo4j = require('neo4j-driver');
const schemaMapper = require('./common/schemaMapper');
const merger = require('./common/merger');

class Neo4JAdapter {
    constructor(params) {
        this._bolt = params.bolt;
        this._node = params.node;
        this._schemaKey = params.schemaKey;
        this._modelVersionKey = params.modelVersionKey;
        this._modelIdentifier = params.modelIdentifier;
        this._autoConnect = params.autoConnect !== false ? true : params.autoConnect;
        this._driver = null;
        this._session = null;
        this._checkConfigs(params.status);
        this._autoOpen();
    }

    _checkConfigs(status) {
        if (status) {
            return;
        }
        for (const config of ['_modelSchema', '_modelVersionKey', '_modelIdentifier', '_node']) {
            if (this[config] === null || this[config] === undefined) {
                throw `${config} is a required property in config params`.replace('_', '');
            }
        }
        if (Object.keys(this._customAttributes).length > 4) {
            throw `customAttributes should not be greater than 4 keys`;
        }
        if (this._customAttributes) {
            for (const attribute in this._customAttributes) {
                if (typeof attribute !== 'string') {
                    throw `customAttributes should only be strings`;
                }
            }
        }
    }

    async check() {
        try {
            const result = await this._session.run(`MATCH () RETURN 1 LIMIT 1`);
            this._autoClose();
            return !!result.summary;
        } catch (error) {
            console.warn(error);
            return false;
        }
    }

    async create(params) {
        params.query = `CREATE(:${this._node} $placeholder)`;
        const data = await schemaMapper.mapToSchema(params.data, this._schemaKey, this._schemaPath);
        const result = await this._session.writeTransaction(async (txc) => {
            const records = await txc.run(params.query, {placeholder: data});
            return records;
        });
        this._checkDebug(params, result);
        this._autoClose();
        return data;
    }

    async createRelationship(params) {
        if (!params.query.includes('-') && !params.query.includes('[')) {
            throw 'INTEGRITY ERROR: Please only use this function to create relationships;';
        }
        const result = await this._session.run(params.query, params.placeholder);
        this._checkDebug(params, result);
        this._autoClose();
        return result;
    }

    async read(params) {
        const results = await this.match(params);
        return results;
    }

    async match(params) {
        const result = await this._session.readTransaction(async (txc) => {
            const records = await txc.run(params.query, params.placeholder);
            return records;
        });
        this._checkDebug(params, result);
        this._autoClose();
        return result.records ? this._serialize(result.records, params.serialize, params.search) : [];
    }

    async update(params) {
        const results = await this.set(params);
        return results;
    }

    async set(params) {
        params.serialize = false;
        const originalData = await this.match(params);
        if (!originalData.length) {
            throw 'ATOMIC ERROR: No records found; record must have been deleted';
        }
        const mergedData = await merger.merge(params, originalData[0]._fields[0].properties);
        const updatedData = await schemaMapper.mapToSchema(mergedData, this._schemaKey, this._schemaPath);
        params.updateQuery = `MATCH (n:${this._node}) WHERE n.${this._modelIdentifier} = $id AND n.${this._modelVersionKey} = $version SET n = $placeholder RETURN n`;
        this._autoOpen();
        const result = await this._session.writeTransaction(async (txc) => {
            const records = await txc.run(params.updateQuery, {
                id: updatedData[this._modelIdentifier],
                version: params.originalVersionKey,
                placeholder: updatedData
            });
            return records;
        });
        if (!result.records.length) {
            throw 'ATOMIC ERROR: No records updated; version has changed';
        }
        this._checkDebug(params, result);
        this._autoClose();
        return updatedData;
    }

    async delete(params) {
        const results = await this.remove(params);
        return results;
    }

    async remove(params) {
        const readResult = await this._getBeforeDelete(params);
        const delResult = await this._performDelete(params);
        this._checkDebug(params, delResult);
        return readResult;
    }

    async query(queryString, searchCriteria) {
        if (!queryString.includes('$')) {
            throw 'SECURITY ERROR: You must use placeholders with symbol $ to avoid injection;';
        }
        const result = await this._session.readTransaction(async (txc) => {
            const records = await txc.run(queryString, searchCriteria);
            return records;
        });
        this._autoClose();
        return result;
    }

    _autoOpen() {
        if (this._autoConnect) {
            this._driver = neo4j.driver(this._bolt.url, neo4j.auth.basic(this._bolt.user, this._bolt.password));
            this._session = this._driver.session();
        }
    }

    _autoClose() {
        if (this._autoConnect) {
            this._session.close();
            this._driver.close();
        }
    }

    open() {
        this._driver = neo4j.driver(this._bolt.url, neo4j.auth.basic(this._bolt.user, this._bolt.password));
        this._session = this._driver.session();
    }

    close() {
        this._session.close();
        this._driver.close();
    }

    async _performDelete(params) {
        this._autoOpen();
        params.deleteQuery = `MATCH (n:${this._node}) WHERE n.${this._modelIdentifier} = $id WITH n LIMIT 1 DETACH DELETE (n)`;
        params.deleteParams = {id: params.deleteIdentifier};
        const result = await this._session.writeTransaction(async (txc) => {
            const records = await txc.run(params.deleteQuery, params.deleteParams);
            return records;
        });
        this._autoClose();
        return result;
    }

    async _getBeforeDelete(params) {
        params.query = `MATCH (n:${this._node}) WHERE n.${this._modelIdentifier} = $id RETURN (n) LIMIT 1`;
        params.placeholder = {id: params.deleteIdentifier};
        params.serialize = true;
        const result = await this.match(params);
        return result;
    }

    _serialize(recordsObj, serialize = true, search = false) {
        if (!serialize) {
            return recordsObj;
        }
        const jsonRecords = JSON.parse(JSON.stringify(recordsObj));
        const relationships = this._groupRelationships(jsonRecords);
        if (!relationships.length) {
            const properties = this._normalizeProperties(jsonRecords, search);
            return properties;
        }
        const serialized = this._consolidateRelationships(relationships);
        return serialized;
    }

    _groupRelationships(records) {
        const relationships = [];
        for (const record of records) {
            const edges = this._groupEdges(record._fields);
            if (edges.length) {
                const nodes = this._groupNodes(record._fields);
                const connections = this._connectNodes(nodes, edges);
                const relationship = this._consolidateNodes(connections);
                if (Object.entries(relationship).length) {
                    relationships.push(relationship);
                }
            }
        }
        return relationships;
    }

    _groupEdges(fields) {
        const edges = [];
        for (const field of fields) {
            if (field.start && field.end) {
                edges.push({
                    start: field.start.low,
                    end: field.end.low,
                    type: field.type,
                    properties: this._normalizeNumbers(field.properties)
                });
            }
        }
        return edges;
    }

    _groupNodes(fields) {
        const nodes = {};
        for (const field of fields) {
            if (field.labels) {
                nodes[field.identity.low] = {
                    labels: field.labels,
                    properties: this._normalizeNumbers(field.properties)
                };
            }
        }
        return nodes;
    }

    _normalizeProperties(records, search = false) {
        const normalized = {
            [this._node]: []
        };
        for (const record of records) {
            const fields = search ? record._fields[0] : record._fields;
            for (const field of fields) {
                const properties = this._normalizeNumbers(field.properties);
                normalized[this._node].push(properties);
            }
        }
        return normalized;
    }

    _normalizeNumbers(properties) {
        if (!properties) {
            return properties;
        }
        for (const [propkey, propValue] of Object.entries(properties)) {
            if (typeof propValue.low === 'number') {
                record[propkey] = propValue.low;
            }
        }
        return properties;
    }

    _connectNodes(nodes, edges) {
        const connections = {};
        for (const edge of edges) {
            if (!connections[edge.start]) {
                connections[edge.start] = nodes[edge.start];
            }
            if (!connections[edge.start][edge.type]) {
                connections[edge.start][edge.type] = {};
            }
            connections[edge.start][edge.type] = nodes[edge.end].properties;
        }
        return connections;
    }

    _consolidateNodes(connections) {
        const consolidated = {};
        for (const connection of Object.values(connections)) {
            const label = connection.labels.join('-');
            if (connection.labels && !consolidated[label]) {
                consolidated[label] = [];
            }
            const {properties} = connection;
            delete connection.labels;
            delete connection.properties;
            consolidated[label].push({...properties, ...connection});
        }
        return consolidated;
    }

    _consolidateRelationships(relationships) {
        const consolidated = {};
        for (const relationship of relationships) {
            for (const [label, nodes] of Object.entries(relationship)) {
                for (const node of nodes) {
                    if (!consolidated[label]) {
                        consolidated[label] = [];
                    }
                    if (this._uniqueNode(node, consolidated[label])) {
                        consolidated[label].push(node);
                    }
                }
            }
        }
        return consolidated;
    }

    _uniqueNode(node, nodeGroup) {
        for (const member of nodeGroup) {
            if (JSON.stringify(member) === JSON.stringify(node)) {
                return false;
            }
        }
        return true;
    }

    _checkDebug(params, result = {}) {
        if (params.debug) {
            console.log('params:', JSON.stringify(params));
            console.log('results:', JSON.stringify(result));
        }
    }
}

module.exports = Neo4JAdapter;
