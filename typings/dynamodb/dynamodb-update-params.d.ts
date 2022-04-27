import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';
import {DynamoDBUpdateOperations} from './dynamodb-operations';
import {DynamoDBReadItemInput} from './dynamodb-read-item-input';
import {OperationsParams} from './operations-params';

export declare type DynamoDBUpdateParams<TData> = QueryParams<DynamoDBReadItemInput>
    & DataParams<TData>
    & Partial<OperationsParams<DynamoDBUpdateOperations>>
    & {
    overwriteArray?: boolean;
    originalVersionKey: string;
};
