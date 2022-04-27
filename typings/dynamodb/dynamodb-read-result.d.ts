import {DynamoDBGetResult} from './dynamodb-get-result';
import {DynamoDBQueryResult} from './dynamodb-query-result';
import {DynamoDBScanResult} from './dynamodb-scan-result';

export declare type DynamoDBReadResult = DynamoDBGetResult | DynamoDBQueryResult | DynamoDBScanResult;
