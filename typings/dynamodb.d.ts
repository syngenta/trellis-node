import {
    DataParams,
    QueryParams,
    BaseAdapterParams
} from './common';

declare type DynamoDBQueryOperation = 'query';
declare type DynamoDBScanOperation = 'scan';
declare type DynamoDBGetOperation = 'get';
declare type DynamoDBOverwriteOperation = 'overwrite';

export declare type DynamoDBEngine = 'dynamodb';
export declare type DynamoDBOperations =
    | DynamoDBQueryOperation | DynamoDBScanOperation | DynamoDBOverwriteOperation | DynamoDBGetOperation;

export declare type DynamoDBAdapterParams = BaseAdapterParams<DynamoDBEngine>;

declare type DtaKey = Record<string, unknown>;

declare type ItemInput<TKey> = {
    Key: TKey;
};

declare type QueryItemInput = {
    ExpressionAttributeValues: DtaKey;
    ExpressionAttributeNames?: Record<string, string>;
    KeyConditionExpression: string;
    IndexName?: string;
    Limit?: number;
};

declare type ScanItemInput<TKey> = {
    ExclusiveStartKey: TKey;
    unique_identifier: string;
};

declare type OperationsParams<TOperations = DynamoDBOperations> = {
    operation: TOperations;
};

declare type DynamoDBBatchOverwriteParams<TData> = DataParams<Array<TData>>;

declare type DynamoDBBatchGetParams<TKey>  = {
    keys: Array<TKey>;
    batch_size?: number;
};
export declare type DynamoDBCreateOperations = DynamoDBOverwriteOperation;

export declare type DynamoDBCreateParams<TData, TQuery = undefined> =
    Partial<OperationsParams<DynamoDBCreateOperations>>
    & DataParams<TData>
    & Partial<QueryParams<TQuery>>;

export declare type DynamoDBInsertParams<TData, TQuery = undefined> = DataParams<TData>
    & Partial<QueryParams<TQuery>>;

export declare type DynamoDBOverwriteParams<TData, TQuery = undefined> = DataParams<TData>
    & Partial<QueryParams<TQuery>>;

export declare type DynamoDBReadOperations = DynamoDBQueryOperation | DynamoDBScanOperation;

declare type DynamoDBReadItemInput = ItemInput<DtaKey>;
declare type DynamoDBQueryItemInput = QueryItemInput;
declare type DynamoDBScanItemInput = ScanItemInput<DtaKey>;

export declare type DynamoDBReadParams = Partial<OperationsParams<DynamoDBReadOperations>> 
    & QueryParams<DynamoDBReadItemInput | DynamoDBQueryItemInput | DynamoDBScanItemInput>;

export declare type DynamoDBGetParams = QueryParams<DynamoDBReadItemInput>;
export declare type DynamoDBQueryParams = QueryParams<DynamoDBQueryItemInput>;
export declare type DynamoDBScanParams = Partial<QueryParams<DynamoDBScanItemInput>>;

declare type DynamoDBDeleteItemInput = ItemInput<DtaKey>;

export declare type DynamoDBDeleteParams = Partial<QueryParams<DynamoDBDeleteItemInput>>;

declare type DynamoDBDeleteResult = DtaKey;
declare type DynamoDBGetResult = DtaKey;
declare type DynamoDBQueryResult = DtaKey[];
declare type DynamoDBScanResult = DtaKey[];
declare type DynamoDBReadResult = DynamoDBGetResult | DynamoDBQueryResult | DynamoDBScanResult;

declare type DynamoDBUpdateOperations = DynamoDBQueryOperation;

export declare type DynamoDBUpdateParams<TData> = QueryParams<DynamoDBReadItemInput>
    & DataParams<TData>
    & Partial<OperationsParams<DynamoDBUpdateOperations>>
    & {
    overwriteArray?: boolean;
    originalVersionKey: string;
};

export declare class DynamodbAdapter {
    check(): Promise<boolean>;
    batchOverwrite<TData, TResult = TData>(params: DynamoDBBatchOverwriteParams<TData>): Promise<TResult>;
    batchGet<TKey, TResult>(params: DynamoDBBatchGetParams<TKey>): Promise<TResult>;

    create<TData, TResult = TData>(params: DynamoDBCreateParams<TData>): Promise<TResult>;
    insert<TData, TResult = TData>(params: DynamoDBInsertParams<TData>): Promise<TResult>;
    overwrite<TData, TResult = TData>(params: DynamoDBOverwriteParams<TData>): Promise<TResult>;

    read<TResult = DynamoDBReadResult>(params: DynamoDBReadParams): Promise<TResult>;
    get<TResult = DynamoDBGetResult>(params: DynamoDBGetParams): Promise<TResult>;
    query<TResult = DynamoDBQueryResult>(params: DynamoDBQueryParams): Promise<TResult>;
    scan<TResult = DynamoDBScanResult>(params?: DynamoDBScanParams): Promise<TResult>;

    update<TData, TResult = TData>(params: DynamoDBUpdateParams<TData>): Promise<TResult>;

    delete<TResult = DynamoDBDeleteResult>(params: DynamoDBDeleteParams): Promise<TResult>;
}
