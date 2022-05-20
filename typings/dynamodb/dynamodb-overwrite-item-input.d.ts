import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

export type DynamoDBOverwriteItemInput = Omit<DocumentClient.PutItemInput, 'TableName' | 'Item'>;
