import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

export declare type DynamoDBDeleteItemInput = Omit<DocumentClient.DeleteItemInput, 'TableName' | 'ReturnValues'>;
