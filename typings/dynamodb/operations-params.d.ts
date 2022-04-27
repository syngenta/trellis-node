import {DynamoDBOperations} from './dynamodb-operations';

export declare type OperationsParams<TOperations = DynamoDBOperations> = {
    operation: TOperations;
};
