export declare type DynamoDBQueryOperation = 'query';
export declare type DynamoDBScanOperation = 'scan';
export declare type DynamoDBGetOperation = 'get';
export declare type DynamoDBOverwriteOperation = 'overwrite';
export declare type DynamoDBInsertOperation = 'insert';

export declare type DynamoDBOperations =
    | DynamoDBQueryOperation | DynamoDBScanOperation | DynamoDBOverwriteOperation | DynamoDBGetOperation;
