import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';

export declare type DynamoDBOverwriteParams<TData, TQuery = undefined> = DataParams<TData>
    & Partial<QueryParams<TQuery>>;
