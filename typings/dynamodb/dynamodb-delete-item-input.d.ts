import {DeleteItemInput} from 'aws-sdk/clients/dynamodb';

export declare type DynamoDBDeleteItemInput = Omit<DeleteItemInput, 'TableName' | 'ReturnValues'>;
