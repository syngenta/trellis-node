import {QueryParams} from '../common/query-params';
import {DynamoDBReadOperations} from './dynamodb-operations';
import {DynamoDBQueryItemInput} from './dynamodb-query-item-input';
import {DynamoDBReadItemInput} from './dynamodb-read-item-input';
import {DynamoDBScanItemInput} from './dynamodb-scan-item-input';
import {OperationsParams} from './operations-params';

export declare type DynamoDBReadParams = Partial<OperationsParams<DynamoDBReadOperations>>
    & QueryParams<DynamoDBReadItemInput | DynamoDBQueryItemInput | DynamoDBScanItemInput>;
