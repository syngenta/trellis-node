const DynamoDB = require('./dynamodb');
const Neo4J = require('./neo4j');

exports.getAdapter = async (params) => {
    const supportedEngines = ['dynamodb', 'neo4j'];
    let adapter = null;
    if (!supportedEngines.includes(params.engine)) {
        throw `${params.engine} is not supported`;
    } else if (params.engine === 'dynamodb') {
        adapter = await new DynamoDB(params);
    } else if (params.engine === 'neo4j') {
        adapter = await new Neo4J(params);
    }
    return adapter;
};
