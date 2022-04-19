export type DtaEngines = 'dynamodb' | 'neo4j';

type DynamoDBQueryOperation = 'query';
type DynamoDBScanOperation = 'scan';
type DynamoDBGetOperation = 'get';
type DynamoDBOverwriteOperation = 'overwrite';

export type DynamoDBOperations =
    | DynamoDBQueryOperation | DynamoDBScanOperation | DynamoDBOverwriteOperation | DynamoDBGetOperation;

type DtaKey = Record<string, unknown>;

interface BaseAdapterParams<TEngine extends DtaEngines> {
    engine: TEngine;
    table: string;
    snsTopicArn?: string;
    authorIdentifier?: string;
    snsAttributes?: string;
    snsRegion?: string;
    snsEndpoint?: string;
    region?: string;
    endpoint?: string;
    status?: string;
    modelSchema: string;
    modelSchemaFile: string;
    modelVersionKey: string;
    modelIdentifier: string;
}

type DynamoDBAdapterParams = BaseAdapterParams<'dynamodb'>;
type Neo4JAdapterParams = BaseAdapterParams<'neo4j'>;

export type DtaAdapterParams = DynamoDBAdapterParams | Neo4JAdapterParams;

interface QueryParams<TQuery> {
    query: TQuery;
}

interface ItemInput<TKey> {
    Key: TKey;
}

interface QueryItemInput {
    ExpressionAttributeValues: DtaKey;
    ExpressionAttributeNames?: Record<string, string>;
    KeyConditionExpression: string;
    IndexName?: string;
    Limit?: number;
}

interface ScanItemInput<TKey> {
    ExclusiveStartKey: TKey;
    unique_identifier: string;
}

interface OperationsParams<TOperations extends DynamoDBOperations> {
    operation: TOperations;
}

interface DataParams<TData> {
    data: TData;
}

interface DynamoDBBatchOverwriteParams<TData> extends DataParams<Array<TData>> {}

interface DynamoDBBatchGetParams<TKey> {
    keys: Array<TKey>;
    batch_size?: number;
}
export type DynamoDBCreateOperations = DynamoDBOverwriteOperation;

export interface DynamoDBCreateParams<TData, TQuery = undefined>
    extends Partial<OperationsParams<DynamoDBCreateOperations>>,
        DataParams<TData>,
        Partial<QueryParams<TQuery>> {}

export interface DynamoDBInsertParams<TData, TQuery = undefined> extends DataParams<TData>,
    Partial<QueryParams<TQuery>> {}

export interface DynamoDBOverwriteParams<TData, TQuery = undefined> extends DataParams<TData>,
    Partial<QueryParams<TQuery>> {}

export type DynamoDBReadOperations = DynamoDBQueryOperation | DynamoDBScanOperation;

type DynamoDBReadItemInput = ItemInput<DtaKey>;
type DynamoDBQueryItemInput = QueryItemInput;
type DynamoDBScanItemInput = ScanItemInput<DtaKey>;

export interface DynamoDBReadParams extends Partial<
    OperationsParams<DynamoDBReadOperations>>,
    QueryParams<DynamoDBReadItemInput | DynamoDBQueryItemInput | DynamoDBScanItemInput> {
}
export interface DynamoDBGetParams extends QueryParams<DynamoDBReadItemInput> {}
export interface DynamoDBQueryParams extends QueryParams<DynamoDBQueryItemInput> {}
export interface DynamoDBScanParams extends Partial<QueryParams<DynamoDBScanItemInput>> {}

type DynamoDBDeleteItemInput = ItemInput<DtaKey>;

export type DynamoDBDeleteParams = Partial<QueryParams<DynamoDBDeleteItemInput>>;

type DynamoDBDeleteResult = DtaKey;
type DynamoDBGetResult = DtaKey;
type DynamoDBQueryResult = DtaKey[];
type DynamoDBScanResult = DtaKey[];
type DynamoDBReadResult = DynamoDBGetResult | DynamoDBQueryResult | DynamoDBScanResult;

type DynamoDBUpdateOperations = DynamoDBQueryOperation;

export interface DynamoDBUpdateParams<TData> extends QueryParams<DynamoDBReadItemInput>,
    DataParams<TData>, Partial<OperationsParams<DynamoDBUpdateOperations>>{
    overwriteArray?: boolean;
    originalVersionKey: string;
}

declare class DynamodbAdapter {
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

export interface Neo4JReadParams extends QueryParams<string> {
    serialize: boolean;
    search: boolean;
    debug?: boolean;
}

export interface Neo4JCreateParams<TData> extends DataParams<TData> {}

export interface Neo4JUpdateParams<TData> extends QueryParams<string>, DataParams<TData> {
    search: boolean;
    originalVersionKey: string;
    debug?: boolean;
    overwriteArray?: boolean;
}

export interface Neo4JRemoveParams {
    deleteIdentifier: string;
}

export interface Neo4JCreateRelationshipParams {
    query: string;
    placeholder: Record<string, unknown>;
}

declare class Neo4JAdapter {
    check(): Promise<boolean>;
    open(): Promise<void>;
    close(): Promise<void>;
    read<TResult>(params: Neo4JReadParams): Promise<TResult | []>;
    match<TResult>(params: Neo4JReadParams): Promise<TResult | []>;
    create<TData, TResult = TData>(params: Neo4JCreateParams<TData>): Promise<TResult>;
    createRelationship<TResult>(params: Neo4JCreateRelationshipParams): Promise<TResult>;
    update<TData, TResult = TData>(params: Neo4JUpdateParams<TData>): Promise<TResult>;
    set<TData, TResult = TData>(params: Neo4JUpdateParams<TData>): Promise<TResult>;
    delete<TResult>(params: Neo4JRemoveParams): Promise<TResult | []>;
    remove<TResult>(params: Neo4JRemoveParams): Promise<TResult | []>;
    query<TResult>(queryString: string, searchCriteria: Record<string, unknown>): Promise<TResult>;
}

declare function getAdapter(params: DynamoDBAdapterParams): DynamodbAdapter;
declare function getAdapter(params: Neo4JAdapterParams): Neo4JAdapter;
