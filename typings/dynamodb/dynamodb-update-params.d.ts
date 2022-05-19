import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';
import {DynamoDBGetOperation, DynamoDBQueryOperation} from './dynamodb-operations';
import {DynamoDBGetItemInput} from './dynamodb-get-item-input';
import {OperationsParams} from './operations-params';
import {DynamoDBQueryItemInput} from './dynamodb-query-item-input';

type GetOriginalData = QueryParams<DynamoDBGetItemInput> & Partial<OperationsParams<DynamoDBGetOperation>>
    | QueryParams<DynamoDBQueryItemInput> & OperationsParams<DynamoDBQueryOperation>;

export declare type DynamoDBUpdateParams<TData> = GetOriginalData
    & DataParams<TData>
    & {
    overwriteArray?: boolean;
    originalVersionKey: string;
};
