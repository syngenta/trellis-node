import {Neo4JCreateParams} from './neo4j-create-params';
import {Neo4JCreateRelationshipParams} from './neo4j-create-relationship-params';
import {Neo4JReadParams} from './neo4j-read-params';
import {Neo4JRemoveParams} from './neo4j-remove-params';
import {Neo4JUpdateParams} from './neo4j-update-params';

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
