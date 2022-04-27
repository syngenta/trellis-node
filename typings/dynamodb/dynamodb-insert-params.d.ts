import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';

export declare type DynamoDBInsertParams<TData, TQuery = undefined> = DataParams<TData>
    & Partial<QueryParams<TQuery>>;
