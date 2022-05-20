import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

export declare type DynamoDBGetItemInput = Omit<DocumentClient.GetItemInput, 'TableName'>;
