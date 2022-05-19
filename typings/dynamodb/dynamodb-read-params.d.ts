import {OperationsParams} from './operations-params';
import {DynamoDBGetParams} from './dynamodb-get-params';
import {DynamoDBQueryParams} from './dynamodb-query-params';
import {DynamoDBScanParams} from './dynamodb-scan-params';
import {DynamoDBGetOperation, DynamoDBScanOperation, DynamoDBQueryOperation} from './dynamodb-operations';

export declare type DynamoDBReadParams = 
    Partial<OperationsParams<DynamoDBGetOperation>> & DynamoDBGetParams
| OperationsParams<DynamoDBScanOperation> & DynamoDBScanParams
| OperationsParams<DynamoDBQueryOperation> & DynamoDBQueryParams;
