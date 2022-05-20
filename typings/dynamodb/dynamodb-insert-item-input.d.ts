import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

export declare type DynamoDBInsertItemInput = Omit<DocumentClient.PutItemInput, 'TableName' | 'Item' | 'ConditionExpression'>;
