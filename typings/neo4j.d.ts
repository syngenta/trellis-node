import {
    DataParams,
    QueryParams,
    BaseAdapterParams
} from './common';

export declare type Neo4JEngine = 'neo4j'

export declare type Neo4JAdapterParams = BaseAdapterParams<Neo4JEngine>;

export declare type Neo4JReadParams = QueryParams<string> & {
    serialize: boolean;
    search: boolean;
    debug?: boolean;
};

export declare type Neo4JCreateParams<TData> = DataParams<TData>;

export declare type Neo4JUpdateParams<TData> = QueryParams<string> & DataParams<TData> & {
    search: boolean;
    originalVersionKey: string;
    debug?: boolean;
    overwriteArray?: boolean;
};

export declare type Neo4JRemoveParams = {
    deleteIdentifier: string;
};

export declare type Neo4JCreateRelationshipParams = {
    query: string;
    placeholder: Record<string, unknown>;
};

export declare class Neo4JAdapter {
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
