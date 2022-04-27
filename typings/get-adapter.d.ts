import {DynamodbAdapter, DynamoDBAdapterParams} from './dynamodb';
import {Neo4JAdapter, Neo4JAdapterParams} from './neo4j';

export declare function getAdapter(params: Neo4JAdapterParams): Neo4JAdapter;
export declare function getAdapter(params: DynamoDBAdapterParams): DynamodbAdapter;
