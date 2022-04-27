import {DynamoDBBatchGetParams} from './dynamodb-batch-get-params';
import {DynamoDBBatchOverwriteParams} from './dynamodb-batch-overwrite-params';
import {DynamoDBCreateParams} from './dynamodb-create-params';
import {DynamoDBDeleteParams} from './dynamodb-delete-params';
import {DynamoDBDeleteResult} from './dynamodb-delete-result';
import {DynamoDBGetParams} from './dynamodb-get-params';
import {DynamoDBGetResult} from './dynamodb-get-result';
import {DynamoDBInsertParams} from './dynamodb-insert-params';
import {DynamoDBOverwriteParams} from './dynamodb-overwrite-params';
import {DynamoDBQueryParams} from './dynamodb-query-params';
import {DynamoDBQueryResult} from './dynamodb-query-result';
import {DynamoDBReadParams} from './dynamodb-read-params';
import {DynamoDBReadResult} from './dynamodb-read-result';
import {DynamoDBScanParams} from './dynamodb-scan-params';
import {DynamoDBScanResult} from './dynamodb-scan-result';
import {DynamoDBUpdateParams} from './dynamodb-update-params';

export declare class DynamodbAdapter {
    check(): Promise<boolean>;
    batchOverwrite<TData, TResult = TData>(params: DynamoDBBatchOverwriteParams<TData>): Promise<TResult>;
    batchGet<TKey, TResult>(params: DynamoDBBatchGetParams<TKey>): Promise<TResult>;

    create<TData, TResult = TData>(params: DynamoDBCreateParams<TData>): Promise<TResult>;
    insert<TData, TResult = TData>(params: DynamoDBInsertParams<TData>): Promise<TResult>;
    overwrite<TData, TResult = TData>(params: DynamoDBOverwriteParams<TData>): Promise<TResult>;

    read<TResult = DynamoDBReadResult>(params: DynamoDBReadParams): Promise<TResult>;
    get<TResult = DynamoDBGetResult>(params: DynamoDBGetParams): Promise<TResult>;
    query<TResult = DynamoDBQueryResult>(params: DynamoDBQueryParams): Promise<TResult>;
    scan<TResult = DynamoDBScanResult>(params?: DynamoDBScanParams): Promise<TResult>;

    update<TData, TResult = TData>(params: DynamoDBUpdateParams<TData>): Promise<TResult>;

    delete<TResult = DynamoDBDeleteResult>(params: DynamoDBDeleteParams): Promise<TResult>;
}
