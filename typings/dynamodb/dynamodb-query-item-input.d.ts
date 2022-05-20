import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

export declare type DynamoDBQueryItemInput = Omit<DocumentClient.QueryInput, 'TableName'>;
