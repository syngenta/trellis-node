import {PutItemInput} from 'aws-sdk/clients/dynamodb';

export declare type DynamoDBInsertItemInput = Omit<PutItemInput, 'TableName' | 'Item' | 'ConditionExpression'>;
