import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';
import {DynamoDBCreateOperations} from './dynamodb-operations';
import {OperationsParams} from './operations-params';

export declare type DynamoDBCreateParams<TData, TQuery = undefined> =
    Partial<OperationsParams<DynamoDBCreateOperations>>
    & DataParams<TData>
    & Partial<QueryParams<TQuery>>;
