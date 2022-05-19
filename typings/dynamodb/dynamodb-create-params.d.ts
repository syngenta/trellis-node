import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';
import {DynamoDBInsertOperation, DynamoDBOverwriteOperation} from './dynamodb-operations';
import {OperationsParams} from './operations-params';
import {DynamoDBOverwriteItemInput} from './dynamodb-overwrite-item-input';
import {DynamoDBInsertItemInput} from './dynamodb-insert-item-input';

type CreateOperations = OperationsParams<DynamoDBOverwriteOperation> & Partial<QueryParams<DynamoDBOverwriteItemInput>>
    | Partial<OperationsParams<DynamoDBInsertOperation>> & Partial<QueryParams<DynamoDBInsertItemInput>>;


export declare type DynamoDBCreateParams<TData, TQuery = undefined> =
    CreateOperations
    & DataParams<TData>;
