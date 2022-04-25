export * from './neo4j';
export * from './dynamodb';

import {Neo4JAdapter, Neo4JAdapterParams} from './neo4j';
import {
    DynamodbAdapter,
    DynamoDBAdapterParams,
} from './dynamodb';

export declare type DtaAdapterParams = DynamoDBAdapterParams | Neo4JAdapterParams;

export declare function getAdapter(params: Neo4JAdapterParams): Neo4JAdapter;
export declare function getAdapter(params: DynamoDBAdapterParams): DynamodbAdapter;
