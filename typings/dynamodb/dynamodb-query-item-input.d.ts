import {QueryInput} from 'aws-sdk/clients/dynamodb';

export declare type DynamoDBQueryItemInput = Omit<QueryInput, 'TableName'>;
