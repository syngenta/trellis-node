import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

export declare type DynamoDBScanItemInput = Omit<DocumentClient.ScanInput, 'TableName'> & { unique_identifier?: string };
