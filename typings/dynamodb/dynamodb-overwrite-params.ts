import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';
import {DynamoDBOverwriteItemInput} from './dynamodb-overwrite-item-input';

export declare type DynamoDBOverwriteParams<TData> = DataParams<TData>
    & Partial<QueryParams<DynamoDBOverwriteItemInput>>;
