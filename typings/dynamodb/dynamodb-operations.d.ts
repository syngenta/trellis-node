declare type DynamoDBQueryOperation = 'query';
declare type DynamoDBScanOperation = 'scan';
declare type DynamoDBGetOperation = 'get';
declare type DynamoDBOverwriteOperation = 'overwrite';

export declare type DynamoDBOperations =
    | DynamoDBQueryOperation | DynamoDBScanOperation | DynamoDBOverwriteOperation | DynamoDBGetOperation;

export declare type DynamoDBReadOperations = DynamoDBQueryOperation | DynamoDBScanOperation;
export declare type DynamoDBUpdateOperations = DynamoDBQueryOperation;
export declare type DynamoDBCreateOperations = DynamoDBOverwriteOperation;
