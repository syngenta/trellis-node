import {ScanInput} from 'aws-sdk/clients/dynamodb';

export declare type DynamoDBScanItemInput = Omit<ScanInput, 'TableName'> & { unique_identifier?: string };
