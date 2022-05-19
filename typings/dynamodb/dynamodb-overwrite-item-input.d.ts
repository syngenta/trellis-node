import {PutItemInput} from 'aws-sdk/clients/dynamodb';

export type DynamoDBOverwriteItemInput = Omit<PutItemInput, 'TableName' | 'Item'>;
