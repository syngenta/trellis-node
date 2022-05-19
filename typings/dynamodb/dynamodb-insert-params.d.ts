import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';
import {DynamoDBInsertItemInput} from './dynamodb-insert-item-input';

export declare type DynamoDBInsertParams<TData> = DataParams<TData>
    & Partial<QueryParams<DynamoDBInsertItemInput>>;
