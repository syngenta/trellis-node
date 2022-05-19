import {GetItemInput} from 'aws-sdk/clients/dynamodb';

export declare type DynamoDBGetItemInput = Omit<GetItemInput, 'TableName'>;
