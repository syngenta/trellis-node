const DynamoDB = require('./dynamodb');
const Neo4J = require('./neo4j');

const _engineMapping = {
    dynamodb: DynamoDB,
    neo4j: Neo4J
};

const _checkConfigs = (params) => {
    const supportedEngines = ['dynamodb', 'neo4j'];
    if (!supportedEngines.includes(params.engine)) {
        throw new Error(`${params.engine} is not supported... yet.`);
    }
    if (params.status) {
        return;
    }
    const configs = ['modelSchemaFile', 'modelSchema', 'modelVersionKey', 'modelIdentifier'];
    if (params.engine === 'dynamodb') {
        configs.push('table');
    } else if (params.engine === 'neo4j') {
        configs.push('node');
    }
    for (const config of configs) {
        if (params[config] === null || params[config] === undefined) {
            throw new Error(`${config} is a required property in config params`);
        }
    }
};

exports.getAdapter = async (params) => {
    _checkConfigs(params);
    const Adapter = _engineMapping[params.engine];
    const adapter = await new Adapter(params);
    return adapter;
};
